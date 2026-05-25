import { defineConfig, devices } from '@playwright/test';

// Runtime config injected by the dashboard server via PW_RUNTIME_CONFIG env var.
// Falls back to sensible defaults when running directly from the CLI.
type RC = {
  testDir?: string;
  /** Glob patterns — when set, only matching spec files run (used by the dashboard spec picker) */
  testMatch?: string[];
  fullyParallel?: boolean;
  forbidOnly?: boolean;
  retries?: number;
  workers?: number;
  timeout?: number;
  headed?: boolean;
  baseUrl?: string;
  trace?: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  screenshot?: 'on' | 'off' | 'only-on-failure';
  video?: 'on' | 'off' | 'retain-on-failure';
  outputDir?: string;
  browsers?: { chromium?: boolean; firefox?: boolean; webkit?: boolean };
};

const rc: RC = process.env.PW_RUNTIME_CONFIG ? JSON.parse(process.env.PW_RUNTIME_CONFIG) : {};
const localWebServerUrl = 'http://localhost:5173';

function buildProjects(b?: RC['browsers']) {
  const projects: { name: string; use: object }[] = [];
  // Default: chromium only. Only add others when explicitly enabled.
  if (!b || b.chromium !== false)
    projects.push({ name: 'chromium', use: { ...devices['Desktop Chrome'] } });
  if (b?.firefox) projects.push({ name: 'firefox', use: { ...devices['Desktop Firefox'] } });
  if (b?.webkit) projects.push({ name: 'webkit', use: { ...devices['Desktop Safari'] } });
  return projects.length ? projects : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }];
}

export default defineConfig({
  testDir: rc.testDir ?? './tests',
  // When the dashboard picks specific spec files, honour them via testMatch.
  // The glob pattern '**/sv-api.spec.ts' matches regardless of OS path separator.
  ...(rc.testMatch && rc.testMatch.length > 0 ? { testMatch: rc.testMatch } : {}),
  outputDir: rc.outputDir ?? 'test-results',
  fullyParallel: rc.fullyParallel ?? true,
  forbidOnly: rc.forbidOnly ?? !!process.env.CI,
  retries: rc.retries ?? (process.env.CI ? 1 : 0),
  workers: rc.workers ?? (process.env.CI ? 1 : undefined),
  timeout: rc.timeout ?? 30_000,

  ...(rc.baseUrl
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: localWebServerUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/pw-results.json' }],
  ],

  use: {
    baseURL: rc.baseUrl || undefined,
    headless: rc.headed ? false : true,
    trace: rc.trace ?? 'on-first-retry',
    screenshot: rc.screenshot ?? 'only-on-failure',
    video: rc.video ?? 'retain-on-failure',
  },

  projects: buildProjects(rc.browsers),
});
