import dotenv from 'dotenv'
import prisma from '../lib/prisma';

dotenv.config({ path: '../packages/database/.env' });

const headers = {
  'User-Agent': 'SteamAnalyticsDashboard/1.0',
  'Accept': 'application/json'
};

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

interface ParsedReleaseDate {
  date: Date | null;
  year: number | null;
  month: number | null;
}

function parseSteamReleaseDate(dateString: string | undefined | null): ParsedReleaseDate {
  const empty: ParsedReleaseDate = { date: null, year: null, month: null };
  if (!dateString) return empty;

  const trimmed = dateString.trim();
  if (!trimmed) return empty;


  if (/coming soon|tba|to be announced/i.test(trimmed)) return empty;

  let match = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,})[,]?\s+(\d{4})$/);
  if (match) {
    const [, dayStr, monthStr, yearStr] = match;
    const month = MONTH_MAP[monthStr.slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      return { date: new Date(Date.UTC(year, month, day)), year, month: month + 1 };
    }
  }

  match = trimmed.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (match) {
    const [, monthStr, dayStr, yearStr] = match;
    const month = MONTH_MAP[monthStr.slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      return { date: new Date(Date.UTC(year, month, day)), year, month: month + 1 };
    }
  }

  match = trimmed.match(/^([A-Za-z]{3,})\s+(\d{4})$/);
  if (match) {
    const [, monthStr, yearStr] = match;
    const month = MONTH_MAP[monthStr.slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const year = parseInt(yearStr, 10);
      return { date: new Date(Date.UTC(year, month, 1)), year, month: month + 1 };
    }
  }


  match = trimmed.match(/^(\d{4})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    return { date: new Date(Date.UTC(year, 0, 1)), year, month: null };
  }

  console.log(`Tanınmayan release_date formatı, atlanıyor: "${trimmed}"`);
  return empty;
}

export const runSteamSync = async () => {
  console.log("Steam senkronizasyonu başlatılıyor...");

  const syncRun = await prisma.syncRun.create({
    data: { status: 'RUNNING' },
  });

  try {
    console.log("Steam App listesi çekiliyor...");
    
    const listResponse = await fetch(
    `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${process.env.STEAM_API_KEY}&max_results=50000&format=json`,
    { headers }
    );    
    if (!listResponse.ok) {
    const errorText = await listResponse.text();
    throw new Error(`Steam API Listeleme Hatası (${listResponse.status}): ${errorText.substring(0, 150)}`);
    }

    const listData = await listResponse.json();
    const apps = listData.response.apps
    
    console.log(`Toplam ${apps.length} adet uygulama bulundu.`);

    const gamesToProcess = apps.slice(0, 10);
    let insertedCount = 0;

    const ensuredGenreIds = new Set<string>();

    for (const app of gamesToProcess) {
      console.log(`Oyun detayları çekiliyor: AppID ${app.appid} - ${app.name}`);
      
      const detailResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${app.appid}`, { headers });
      
      if (!detailResponse.ok) {
        console.log(`Oyun (${app.appid}) çekilemedi, atlanıyor. Durum Kodu: ${detailResponse.status}`);
        continue;
      }

      const detailData = await detailResponse.json();

      if (detailData[app.appid]?.success) {
        const gameDetails = detailData[app.appid].data;

        let releaseDate: Date | null = null;
        let releaseYear: number | null = null;
        let releaseMonth: number | null = null;
        let comingSoon = false;

        if (gameDetails.release_date) {
          comingSoon = gameDetails.release_date.coming_soon || false;
          const parsed = parseSteamReleaseDate(gameDetails.release_date.date);
          releaseDate = parsed.date;
          releaseYear = parsed.year;
          releaseMonth = parsed.month;
        }

        const rawGenres: { id: string; description: string }[] = Array.isArray(gameDetails.genres)
          ? gameDetails.genres.filter((g: { id?: string; description?: string }) => g?.id && g?.description)
          : [];

        const newGenres = rawGenres.filter((g) => !ensuredGenreIds.has(g.id));

        if (newGenres.length > 0) {
          await Promise.all(
            newGenres.map((g) =>
              prisma.genre.upsert({
                where: { id: g.id },
                update: { name: g.description },
                create: { id: g.id, name: g.description },
              })
            )
          );
          newGenres.forEach((g) => ensuredGenreIds.add(g.id));
        }

        const genreRelationWrite = {
          create: rawGenres.map((g) => ({
            genre: { connect: { id: g.id } },
          })),
        };

        // Prisma'ya yeni tarih değişkenlerimizi de gönderiyoruz
        await prisma.game.upsert({
          where: { appid: app.appid },
          update: {
            name: gameDetails.name,
            type: gameDetails.type,
            steam_url: `https://store.steampowered.com/app/${app.appid}`,
            header_image: gameDetails.header_image,
            raw_json: gameDetails,
            // Yeni Eklenen Alanlar
            release_date: releaseDate,
            release_year: releaseYear,
            release_month: releaseMonth,
            coming_soon: comingSoon,
            // Var olan tür bağlantılarını temizleyip güncel listeyle yeniden oluşturuyoruz
            genres: {
              deleteMany: {},
              ...genreRelationWrite,
            },
          },
          create: {
            appid: app.appid,
            name: gameDetails.name,
            type: gameDetails.type,
            steam_url: `https://store.steampowered.com/app/${app.appid}`,
            header_image: gameDetails.header_image,
            raw_json: gameDetails,
            // Yeni Eklenen Alanlar
            release_date: releaseDate,
            release_year: releaseYear,
            release_month: releaseMonth,
            coming_soon: comingSoon,
            genres: genreRelationWrite,
          },
        });
        insertedCount++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: 'COMPLETED',
        finished_at: new Date(),
        fetched_count: gamesToProcess.length,
        inserted_count: insertedCount,
      },
    });

    console.log(`Senkronizasyon başarıyla tamamlandı! ${insertedCount} oyun veritabanına yazıldı.`);

  } catch (error) {
    console.error("Senkronizasyon sırasında kritik hata:", error);
    
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: 'FAILED',
        finished_at: new Date(),
        error_message: String(error),
      },
    });
  }
};