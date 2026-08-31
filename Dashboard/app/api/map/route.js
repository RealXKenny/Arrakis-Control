export const dynamic = 'force-dynamic';
export const revalidate = 0;

let duneClient = null;
let initialized = false;

// ============================================================
// DUNE CLIENT
// ============================================================

async function getDuneClient() {
  if (!duneClient) {
    duneClient = new DuneClient(
      process.env.CONSOLE_URL
    );
  }

  // Log into the Dune Console only once.
  if (!initialized) {
    await duneClient.login(
      process.env.CONSOLE_PASSWORD
    );

    initialized = true;
  }

  return duneClient;
}

// ============================================================
// GET /api/map
// ============================================================

export async function GET() {
  const requestStarted = Date.now();

  try {
    // --------------------------------------------------------
    // GET DUNE CLIENT
    // --------------------------------------------------------

    const client = await getDuneClient();

    // --------------------------------------------------------
    // REQUEST BASES
    // --------------------------------------------------------

    const bases = await client.request(
      'GET',
      '/api/bases'
    );

    // --------------------------------------------------------
    // FULL RAW RESPONSE
    // --------------------------------------------------------

    console.dir(bases, {
      depth: null,
      colors: true,
    });

    try {
      console.log(
        '[MAP API] Bases JSON:',
        JSON.stringify(bases, null, 2)
      );
    } catch (jsonError) {
      console.warn(
        '[MAP API] Could not stringify bases:',
        jsonError
      );
    }

    // --------------------------------------------------------
    // DETECT BASE ROWS
    // --------------------------------------------------------

    let baseRows = [];

    if (Array.isArray(bases)) {
      baseRows = bases;
    } else if (Array.isArray(bases?.rows)) {
      baseRows = bases.rows;
    } else if (Array.isArray(bases?.bases)) {
      baseRows = bases.bases;
    } else if (Array.isArray(bases?.data)) {
      baseRows = bases.data;
    } else if (Array.isArray(bases?.data?.rows)) {
      baseRows = bases.data.rows;
    }

    // --------------------------------------------------------
    // PRINT EVERY BASE
    // --------------------------------------------------------

    baseRows.forEach((base) => {
      console.dir(base, {
        depth: null,
        colors: true,
      });
    });

    // --------------------------------------------------------
    // BUILD RESPONSE
    // --------------------------------------------------------

    const responseData = {
      ok: true,

      // Keep the original API response.
      bases,

      // Normalized array for the React map.
      markers: baseRows.map((base, index) => {
        const x =
          base?.x ??
          base?.pos_x ??
          base?.longitude ??
          base?.position?.x ??
          base?.coordinates?.x;

        const y =
          base?.y ??
          base?.pos_y ??
          base?.latitude ??
          base?.position?.y ??
          base?.coordinates?.y;

        return {
          ...base,

          id:
            base?.id ??
            base?.base_id ??
            `base-${index}`,

          name:
            base?.name ??
            base?.base_name ??
            base?.character_name ??
            `Base ${index + 1}`,

          x,
          y,

          icon:
            base?.icon ??
            'Base',
        };
      }),

      count: baseRows.length,

      timestamp:
        new Date().toISOString(),

      durationMs:
        Date.now() - requestStarted,
    };

    // --------------------------------------------------------
    // PRINT NORMALIZED MARKERS
    // --------------------------------------------------------

    console.dir(responseData.markers, {
      depth: null,
      colors: true,
    });

    return Response.json(
      responseData,
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );

  } catch (error) {
    // --------------------------------------------------------
    // ERROR DEBUG
    // --------------------------------------------------------

    console.error('');
    console.error(
      '============================================================'
    );
    console.error('[MAP API] ERROR');
    console.error(
      '============================================================'
    );
    console.error('Error:', error);
    console.error(
      'Error message:',
      error?.message
    );
    console.error(
      'Error stack:',
      error?.stack
    );
    console.error(
      '============================================================'
    );

    return Response.json(
      {
        ok: false,

        error:
          error?.message ||
          'Unable to load map data.',

        bases: [],
        markers: [],
        count: 0,

        timestamp:
          new Date().toISOString(),
      },
      {
        status: 500,

        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}