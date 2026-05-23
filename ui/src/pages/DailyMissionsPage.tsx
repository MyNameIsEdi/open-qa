import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Category =
  | 'Locators'
  | 'Assertions'
  | 'Architecture'
  | 'Security'
  | 'Accessibility'
  | 'CI/CD'
  | 'Agents'
  | 'Network'
  | 'Data Gen';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  xp: number;
  hint?: string;
}

const MISSION_POOL: Mission[] = [
  // Easy (50 XP)
  {
    id: 'loc-01',
    title: 'Write a getByRole locator for a submit button',
    description:
      'Use page.getByRole() to locate a submit button by its ARIA role and accessible name.',
    category: 'Locators',
    difficulty: 'Easy',
    xp: 50,
    hint: 'Try: page.getByRole("button", { name: "Submit" })',
  },
  {
    id: 'loc-02',
    title: 'Use getByLabel to fill a text input',
    description:
      'Target an email input using its associated <label> element instead of a CSS selector.',
    category: 'Locators',
    difficulty: 'Easy',
    xp: 50,
    hint: 'Try: page.getByLabel("Email").fill("user@example.com")',
  },
  {
    id: 'assert-01',
    title: 'Assert a success banner is visible after form submission',
    description:
      'After clicking submit, assert a success alert becomes visible using toBeVisible().',
    category: 'Assertions',
    difficulty: 'Easy',
    xp: 50,
  },
  {
    id: 'assert-02',
    title: 'Verify page URL after navigation',
    description:
      'Use toHaveURL() to assert the browser navigated to the expected route after a click.',
    category: 'Assertions',
    difficulty: 'Easy',
    xp: 50,
    hint: 'Try: await expect(page).toHaveURL("/dashboard")',
  },
  {
    id: 'a11y-01',
    title: 'Check that every form input has a visible label',
    description:
      'Use getByRole("textbox") with a name to prove each input is reachable by its label.',
    category: 'Accessibility',
    difficulty: 'Easy',
    xp: 50,
  },
  {
    id: 'data-01',
    title: 'Generate a test user with faker.js',
    description: 'Install @faker-js/faker and write a buildUser() factory function used in a test.',
    category: 'Data Gen',
    difficulty: 'Easy',
    xp: 50,
    hint: 'npm install -D @faker-js/faker',
  },
  {
    id: 'loc-03',
    title: 'Use getByTestId as a last resort',
    description:
      'Add a data-testid attribute to a component and write a test that uses page.getByTestId().',
    category: 'Locators',
    difficulty: 'Easy',
    xp: 50,
  },
  // Medium (150 XP)
  {
    id: 'arch-01',
    title: 'Create a Page Object Model for a login form',
    description:
      'Build a LoginPage class with typed Locator properties and a login(email, password) action method.',
    category: 'Architecture',
    difficulty: 'Medium',
    xp: 150,
  },
  {
    id: 'arch-02',
    title: 'Add auth storageState to your Playwright config',
    description:
      'Set up a setup project in playwright.config.ts that saves auth state to playwright/.auth/user.json.',
    category: 'Architecture',
    difficulty: 'Medium',
    xp: 150,
    hint: 'Use the "setup" project + dependencies pattern in playwright.config.ts',
  },
  {
    id: 'ci-01',
    title: 'Write a GitHub Actions workflow that runs Playwright on push',
    description:
      'Create .github/workflows/playwright.yml that installs, runs tests, and uploads the HTML report as an artifact on failure.',
    category: 'CI/CD',
    difficulty: 'Medium',
    xp: 150,
  },
  {
    id: 'loc-04',
    title: 'Filter locators with .filter({ hasText }) and .nth()',
    description:
      'Use .filter() to scope to a specific list item and .nth() to select by index — no CSS selectors allowed.',
    category: 'Locators',
    difficulty: 'Medium',
    xp: 150,
  },
  {
    id: 'assert-03',
    title: 'Assert element count after a dynamic list update',
    description:
      'After adding an item to a list, use toHaveCount() to assert the new total number of items.',
    category: 'Assertions',
    difficulty: 'Medium',
    xp: 150,
  },
  {
    id: 'a11y-02',
    title: 'Run axe-core on a page and assert zero critical violations',
    description:
      'Install axe-playwright and write a test that fails if any WCAG 2.1 AA critical violations are found.',
    category: 'Accessibility',
    difficulty: 'Medium',
    xp: 150,
    hint: 'npm install -D @axe-core/playwright',
  },
  {
    id: 'sec-01',
    title: 'Test an input field rejects SQL injection',
    description:
      "Submit a common SQLi payload (' OR 1=1 --) into a login form and assert the app does not log in.",
    category: 'Security',
    difficulty: 'Medium',
    xp: 150,
  },
  // Hard (300-400 XP)
  {
    id: 'net-01',
    title: 'Intercept an API call and validate the request body',
    description:
      'Use page.waitForRequest() to capture the POST body sent after a form submission and assert it matches the expected shape.',
    category: 'Network',
    difficulty: 'Hard',
    xp: 300,
    hint: 'const req = await page.waitForRequest(url => url.includes("/api/login"))',
  },
  {
    id: 'net-02',
    title: 'Mock an API error and verify the UI shows an error state',
    description:
      'Use page.route() to return HTTP 500 from an endpoint and assert the UI renders a proper error message.',
    category: 'Network',
    difficulty: 'Hard',
    xp: 300,
  },
  {
    id: 'sec-02',
    title: 'Verify an XSS payload is escaped in the UI',
    description:
      'Submit <script>alert(1)</script> as user input and assert the DOM shows it as text, not executed JS.',
    category: 'Security',
    difficulty: 'Hard',
    xp: 300,
  },
  {
    id: 'ci-02',
    title: 'Configure a sharded Playwright run across 4 parallel jobs',
    description:
      'Use a matrix strategy with --shard=N/4 to parallelize your test suite across 4 GitHub Actions runner instances.',
    category: 'CI/CD',
    difficulty: 'Hard',
    xp: 300,
  },
  {
    id: 'agent-01',
    title: 'Run the Self-Healing agent on a broken test and commit the fix',
    description:
      'Intentionally break a locator in a test, run the self-healing agent, apply its suggestion, and verify the test passes again.',
    category: 'Agents',
    difficulty: 'Hard',
    xp: 400,
  },
  {
    id: 'agent-02',
    title: 'Use the Auto-POM Builder to generate a POM from a real page',
    description:
      'Copy the DOM from a real login page into the Auto-POM Builder agent and integrate the generated class into a test.',
    category: 'Agents',
    difficulty: 'Hard',
    xp: 400,
  },
  {
    id: 'arch-03',
    title: 'Refactor 3 tests to use a shared fixture with test.extend()',
    description:
      "Extract repeated setup (page.goto + login) into a custom fixture using Playwright's test.extend() API.",
    category: 'Architecture',
    difficulty: 'Hard',
    xp: 300,
  },
];

function getTodayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function getDailyMissions(): Mission[] {
  const today = new Date();
  const seed =
    today.getUTCFullYear() * 10000 + (today.getUTCMonth() + 1) * 100 + today.getUTCDate();

  function seededRandom(s: number) {
    let state = s;
    return () => {
      state = (state * 1664525 + 1013904223) & 0xffffffff;
      return (state >>> 0) / 0xffffffff;
    };
  }
  const rng = seededRandom(seed);
  const arr = [...MISSION_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return [
    arr.find((m) => m.difficulty === 'Easy')!,
    arr.find((m) => m.difficulty === 'Medium')!,
    arr.find((m) => m.difficulty === 'Hard')!,
  ];
}

function getCompletedToday(): string[] {
  try {
    const raw = localStorage.getItem(`missions:completed:${getTodayKey()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveComplete(missionId: string, xp: number, missions: Mission[]) {
  const key = `missions:completed:${getTodayKey()}`;
  const completed = getCompletedToday();
  if (completed.includes(missionId)) return;
  completed.push(missionId);
  localStorage.setItem(key, JSON.stringify(completed));

  const prevXP = parseInt(localStorage.getItem('missions:totalXP') ?? '0', 10);
  localStorage.setItem('missions:totalXP', String(prevXP + xp));

  const allDone = missions.every((m) => completed.includes(m.id));
  if (allDone) {
    const today = getTodayKey();
    const yesterday = (() => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    })();
    const last = localStorage.getItem('missions:lastCompleted');
    let streak = parseInt(localStorage.getItem('missions:streak') ?? '0', 10);
    if (last === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem('missions:streak', String(streak));
    localStorage.setItem('missions:lastCompleted', today);
  }
}

function getStreak(missions: Mission[]): number {
  const completedToday = getCompletedToday();
  const allDoneToday = missions.every((m) => completedToday.includes(m.id));
  const streak = parseInt(localStorage.getItem('missions:streak') ?? '0', 10);
  if (allDoneToday) return streak;
  const yesterday = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  })();
  const last = localStorage.getItem('missions:lastCompleted');
  return last === yesterday ? streak : 0;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  Hard: 'bg-red-50 text-red-600',
};

const CATEGORY_STYLES: Record<Category, string> = {
  Locators: 'bg-blue-50 text-blue-700',
  Assertions: 'bg-purple-50 text-purple-700',
  Architecture: 'bg-indigo-50 text-indigo-700',
  Security: 'bg-rose-50 text-rose-700',
  Accessibility: 'bg-teal-50 text-teal-700',
  'CI/CD': 'bg-orange-50 text-orange-700',
  Agents: 'bg-primary-50 text-primary-700',
  Network: 'bg-cyan-50 text-cyan-700',
  'Data Gen': 'bg-lime-50 text-lime-700',
};

function HintToggle({ hint }: { hint: string }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className="mb-3">
      <button
        onClick={() => setShow(!show)}
        className="text-xs font-medium transition-colors"
        style={{ color: 'var(--primary-600, #4f46e5)' }}
      >
        {show ? t('missions.hint.hide') : t('missions.hint.show')}
      </button>
      {show && (
        <div
          className="mt-2 p-2.5 rounded-lg text-xs font-mono leading-relaxed"
          style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function MissionCard({
  mission,
  isCompleted,
  onComplete,
}: {
  mission: Mission;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${isCompleted ? 'opacity-70' : ''}`}
      style={{
        borderColor: isCompleted ? 'var(--border)' : 'var(--border)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[mission.difficulty]}`}
        >
          {t(`missions.difficulty.${mission.difficulty.toLowerCase()}`)}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_STYLES[mission.category]}`}
        >
          {mission.category}
        </span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 ml-auto">
          {t('missions.xp.badge', { xp: mission.xp })}
        </span>
      </div>

      <h3 className="font-semibold text-sm mb-2 leading-snug" style={{ color: 'var(--text-main)' }}>
        {mission.title}
      </h3>
      <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
        {mission.description}
      </p>

      {mission.hint && !isCompleted && <HintToggle hint={mission.hint} />}

      <button
        onClick={onComplete}
        disabled={isCompleted}
        className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
          isCompleted ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'
        }`}
        style={
          isCompleted
            ? { backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }
            : { backgroundColor: 'var(--primary-600, #4f46e5)', color: '#fff' }
        }
      >
        {isCompleted ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 14 }} /> {t('missions.complete.done')}
          </>
        ) : (
          <>
            <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} /> {t('missions.complete.button')}
          </>
        )}
      </button>
    </div>
  );
}

export default function DailyMissionsPage() {
  const { t } = useTranslation();
  const todayMissions = useMemo(() => getDailyMissions(), []);
  const [completedIds, setCompletedIds] = useState<string[]>(getCompletedToday);
  const [totalXP, setTotalXP] = useState(() =>
    parseInt(localStorage.getItem('missions:totalXP') ?? '0', 10),
  );
  const [streak, setStreak] = useState(() => getStreak(todayMissions));

  const handleComplete = (mission: Mission) => {
    saveComplete(mission.id, mission.xp, todayMissions);
    setCompletedIds(getCompletedToday());
    setTotalXP(parseInt(localStorage.getItem('missions:totalXP') ?? '0', 10));
    setStreak(getStreak(todayMissions));
  };

  const allDone = todayMissions.every((m) => completedIds.includes(m.id));

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2 flex items-center gap-2"
          style={{ color: 'var(--text-main)' }}
        >
          <AssignmentOutlinedIcon sx={{ fontSize: 24 }} className="text-primary-500" />
          {t('missions.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('missions.subtitle')}
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-6 p-4 rounded-2xl border mb-6"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-2">
          <WhatshotIcon sx={{ fontSize: 22 }} style={{ color: '#f97316' }} />
          <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            {streak}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('missions.streak.label')}
          </span>
        </div>
        <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />
        <div className="flex items-center gap-2">
          <BoltIcon sx={{ fontSize: 22 }} style={{ color: '#f59e0b' }} />
          <span className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
            {totalXP}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('missions.xp.total')}
          </span>
        </div>
      </div>

      {/* Date header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('missions.date.label')}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
            {dateLabel}
          </p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('missions.date.reset')}
        </p>
      </div>

      {/* Mission cards */}
      <div className="flex flex-col gap-4">
        {todayMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            isCompleted={completedIds.includes(mission.id)}
            onComplete={() => handleComplete(mission)}
          />
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div
          className="mt-8 p-6 rounded-2xl border-2 text-center animate-fade-up"
          style={{
            borderColor: 'var(--primary-300, #a5b4fc)',
            backgroundColor: 'var(--primary-50, #eef2ff)',
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 40 }} style={{ color: '#f59e0b' }} />
          <h2 className="font-bold text-lg mt-2 mb-1" style={{ color: 'var(--text-main)' }}>
            {t('missions.allDone.title')}
          </h2>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('missions.allDone.subtitle')}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('missions.allDone.comeback')}
          </p>
        </div>
      )}
    </div>
  );
}
