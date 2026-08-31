import { DuneConsoleClient } from '../../../../../infrastructure/api/core/DuneConsoleClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let duneClient = null;
let initialized = false;

/*
 * ============================================================
 * DUNE CLIENT
 * ============================================================
 */

async function getDuneClient() {
  if (!duneClient) {
    console.log('[MAP API] Creating DuneConsoleClient...');

    duneClient = new DuneConsoleClient(
      process.env.CONSOLE_URL
    );
  }

  /*
   * Your old dashboard logged into the Dune Console when
   * the server started:
   *
   * await duneClient.login(process.env.CONSOLE_PASSWORD)
   *
   * Do the same here, but only once.
   */

  if (!initialized) {
    console.log('[MAP API] Logging into Dune Console...');

    await duneClient.login(
      process.env.CONSOLE_PASSWORD
    );

    initialized = true;

    console.log(
      '[MAP API] Dune Console login successful.'
    );
  }

  return duneClient;
}

/*
 * ============================================================
 * GET /api/map
 * ============================================================
 */

export async function GET() {
  const requestStarted = Date.now();

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    '[MAP API] GET /api/map'
  );
  console.log(
    '============================================================'
  );

  try {
    /*
     * --------------------------------------------------------
     * ENVIRONMENT DEBUG
     * --------------------------------------------------------
     */

    console.log(
      '[MAP API] CONSOLE_URL:',
      process.env.CONSOLE_URL
        ? process.env.CONSOLE_URL
        : 'NOT SET'
    );

    console.log(
      '[MAP API] CONSOLE_PASSWORD:',
      process.env.CONSOLE_PASSWORD
        ? 'SET'
        : 'NOT SET'
    );

    /*
     * --------------------------------------------------------
     * GET DUNE CLIENT
     * --------------------------------------------------------
     */

    const client = await getDuneClient();

    console.log(
      '[MAP API] Dune client ready.'
    );

    /*
     * --------------------------------------------------------
     * REQUEST BASES
     * --------------------------------------------------------
     */

    console.log('');
    console.log(
      '[MAP API] Calling Dune endpoint:'
    );

    console.log(
      '[MAP API] GET /api/bases'
    );

    const bases = await client.request(
      'GET',
      '/api/bases'
    );

    /*
     * --------------------------------------------------------
     * FULL RAW RESPONSE
     * --------------------------------------------------------
     */

    console.log('');
    console.log(
      '============================================================'
    );

    console.log(
      '[MAP API] FULL /api/bases RESPONSE'
    );

    console.log(
      '============================================================'
    );

    console.dir(
      bases,
      {
        depth: null,
        colors: true,
      }
    );

    console.log(
      '============================================================'
    );

    /*
     * Also print JSON.
     */

    try {
      console.log(
        '[MAP API] /api/bases JSON:'
      );

      console.log(
        JSON.stringify(
          bases,
          null,
          2
        )
      );
    } catch (jsonError) {
      console.warn(
        '[MAP API] Could not stringify bases:',
        jsonError
      );
    }

    /*
     * --------------------------------------------------------
     * DETECT BASE ROWS
     * --------------------------------------------------------
     *
     * The API may return:
     *
     * {
     *   rows: [...]
     * }
     *
     * or:
     *
     * {
     *   bases: [...]
     * }
     *
     * or:
     *
     * [...]
     */

    let baseRows = [];

    if (Array.isArray(bases)) {
      baseRows = bases;
    } else if (
      Array.isArray(bases?.rows)
    ) {
      baseRows = bases.rows;
    } else if (
      Array.isArray(bases?.bases)
    ) {
      baseRows = bases.bases;
    } else if (
      Array.isArray(bases?.data)
    ) {
      baseRows = bases.data;
    } else if (
      Array.isArray(bases?.data?.rows)
    ) {
      baseRows = bases.data.rows;
    }

    console.log('');
    console.log(
      '[MAP API] BASE ROW COUNT:',
      baseRows.length
    );

    /*
     * --------------------------------------------------------
     * PRINT EVERY BASE
     * --------------------------------------------------------
     */

    baseRows.forEach(
      (base, index) => {
        console.log('');
        console.log(
          '------------------------------------------------------------'
        );

        console.log(
          `[MAP API] BASE #${index + 1}`
        );

        console.log(
          '------------------------------------------------------------'
        );

        console.dir(
          base,
          {
            depth: null,
            colors: true,
          }
        );

        console.log(
          '[MAP API] Base keys:',
          Object.keys(base || {})
        );

        /*
         * Try every coordinate field we know about.
         */

        const x =
          base?.x ??
          base?.pos_x ??
          base?.longitude ??
          base?.position?.x ??
          base?.coordinates?.x ??
          null;

        const y =
          base?.y ??
          base?.pos_y ??
          base?.latitude ??
          base?.position?.y ??
          base?.coordinates?.y ??
          null;

        console.log(
          '[MAP API] Detected X:',
          x
        );

        console.log(
          '[MAP API] Detected Y:',
          y
        );

        console.log(
          '[MAP API] Base ID:',
          base?.id ??
          base?.base_id ??
          'UNKNOWN'
        );

        console.log(
          '[MAP API] Base name:',
          base?.name ??
          base?.base_name ??
          'UNKNOWN'
        );

        console.log(
          '[MAP API] Owner:',
          base?.owner_name ??
          base?.character_name ??
          base?.owner_id ??
          'UNKNOWN'
        );
      }
    );

    /*
     * --------------------------------------------------------
     * BUILD RESPONSE
     * --------------------------------------------------------
     */

    const responseData = {
      ok: true,

      /*
       * Keep the original API response.
       */
      bases,

      /*
       * Also provide a normalized array so the React map
       * can easily consume it.
       */
      markers: baseRows.map(
        (base, index) => {
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
        }
      ),

      count: baseRows.length,

      timestamp:
        new Date().toISOString(),

      durationMs:
        Date.now() - requestStarted,
    };

    /*
     * --------------------------------------------------------
     * FINAL DEBUG
     * --------------------------------------------------------
     */

    console.log('');
    console.log(
      '============================================================'
    );

    console.log(
      '[MAP API] FINAL RESPONSE'
    );

    console.log(
      '[MAP API] Bases:',
      baseRows.length
    );

    console.log(
      '[MAP API] Markers:',
      responseData.markers.length
    );

    console.log(
      '[MAP API] Duration:',
      responseData.durationMs,
      'ms'
    );

    console.log(
      '============================================================'
    );

    /*
     * Print normalized markers.
     */

    console.dir(
      responseData.markers,
      {
        depth: null,
        colors: true,
      }
    );

    console.log(
      '============================================================'
    );

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
    /*
     * --------------------------------------------------------
     * ERROR DEBUG
     * --------------------------------------------------------
     */

    console.error('');
    console.error(
      '============================================================'
    );

    console.error(
      '[MAP API] ERROR'
    );

    console.error(
      '============================================================'
    );

    console.error(
      'Error:',
      error
    );

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
          'Cache-Control':
            'no-store',
        },
      }
    );
  }
}