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

async function fetchSteamGridImage(appId: number | string): Promise<string | null> {
  const apiKey = process.env.STEAMGRIDDB_API_KEY;
  if (!apiKey) {
    console.warn("Uyarı: STEAMGRIDDB_API_KEY bulunamadı, grid_image null dönecek.");
    return null;
  }

  try {
    const response = await fetch(`https://www.steamgriddb.com/api/v2/grids/steam/${appId}?dimensions=600x900`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null; 
      console.warn(`SteamGridDB HTTP ${response.status} hatası döndürdü (AppID: ${appId})`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      return data.data[0].url; 
    }

    return null;
  } catch (error) {
    console.error(`AppID ${appId} için SteamGridDB'den görsel çekilemedi:`, error);
    return null;
  }
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
    const apps = listData.response.apps;
    
    console.log(`Steam'den toplam ${apps.length} adet uygulama bulundu.`);
    console.log("Veritabanındaki mevcut oyunlar kontrol ediliyor...");
    
    const existingGames = await prisma.game.findMany({
      select: { appid: true }
    });

    const existingAppIds = new Set(existingGames.map(g => Number(g.appid)));
    const newApps = apps.filter((app: { appid: number; name: string }) => !existingAppIds.has(app.appid));

    console.log(`Veritabanında bulunmayan, eklenebilecek ${newApps.length} yeni oyun tespit edildi.`);

    const BATCH_SIZE = 10; 
    const gamesToProcess = newApps.slice(0, BATCH_SIZE);
    
    if (gamesToProcess.length === 0) {
      console.log("Senkronize edilecek yeni oyun kalmadı! Veritabanınız güncel.");
      
      await prisma.syncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'COMPLETED',
          finished_at: new Date(),
          fetched_count: 0,
          inserted_count: 0,
        },
      });
      return; 
    }

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

        const gridImageUrl = await fetchSteamGridImage(app.appid);
        if (gridImageUrl) {
           console.log(`SteamGridDB görseli bulundu: ${gridImageUrl}`);
        }

        await prisma.game.upsert({
          where: { appid: app.appid },
          update: {
            name: gameDetails.name,
            type: gameDetails.type,
            steam_url: `https://store.steampowered.com/app/${app.appid}`,
            header_image: gameDetails.header_image,
            grid_image: gridImageUrl,
            raw_json: gameDetails,
            release_date: releaseDate,
            release_year: releaseYear,
            release_month: releaseMonth,
            coming_soon: comingSoon,
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
            grid_image: gridImageUrl, 
            raw_json: gameDetails,
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