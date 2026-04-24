import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../pages/landing.vue', import.meta.url),
  'utf8',
)

assert.match(
  source,
  /<section id="curated-mentor-pool-section" class="[^"]*overflow-hidden[^"]*"/,
  'Curated Mentor Pool section should clip decorative shapes inside the section bounds.',
)

assert.match(
  source,
  /class="[^"]*grid[^"]*gap-12[^"]*min-\[900px\]:items-center[^"]*min-\[900px\]:grid-cols-\[minmax\(240px,0\.85fr\)_minmax\(380px,1\.15fr\)\][^"]*"/,
  'The first row should shift into the side-by-side composition before large-desktop widths.',
)

assert.match(
  source,
  /class="[^"]*grid[^"]*gap-12[^"]*min-\[900px\]:items-end[^"]*min-\[900px\]:grid-cols-\[minmax\(380px,0\.95fr\)_minmax\(240px,1\.05fr\)\][^"]*"/,
  'The second row should mirror the side-by-side composition at the same breakpoint.',
)

assert.match(
  source,
  /class="[^"]*relative[^"]*flex[^"]*justify-center[^"]*min-\[900px\]:justify-start[^"]*shrink-0[^"]*"/,
  'The second portrait should anchor toward the text column instead of the far right edge.',
)

assert.match(
  source,
  /class="[^"]*relative[^"]*w-\[140px\][^"]*h-\[140px\][^"]*sm:w-\[160px\][^"]*sm:h-\[160px\][^"]*min-\[900px\]:w-\[180px\][^"]*min-\[900px\]:h-\[180px\][^"]*xl:w-\[200px\][^"]*xl:h-\[200px\][^"]*"/,
  'The first portrait frame should stay restrained so the top row remains balanced.',
)

assert.match(
  source,
  /Your Company[\s\S]*class="[^"]*relative[^"]*w-\[180px\][^"]*h-\[180px\][^"]*sm:w-\[220px\][^"]*sm:h-\[220px\][^"]*min-\[900px\]:w-\[240px\][^"]*min-\[900px\]:h-\[240px\][^"]*xl:w-\[260px\][^"]*xl:h-\[260px\][^"]*"/,
  'The second portrait frame should be larger while staying aligned near the text column.',
)

assert.match(
  source,
  /class="absolute top-\[8%\] -left-\[64px\] w-\[120px\] sm:w-\[150px\] min-\[900px\]:w-\[180px\][^"]*"/,
  'The left decorative circle should stay cropped and understated after the second size reduction.',
)

assert.match(
  source,
  /class="absolute top-\[52%\] -right-\[52px\] w-\[110px\] sm:w-\[140px\] min-\[900px\]:w-\[180px\][^"]*"/,
  'The right decorative circle should stay smaller so the bottom portrait does not crowd the section edge.',
)

assert.match(
  source,
  /class="text-center max-w-\[860px\] mx-auto mb-14 sm:mb-\[4\.5rem\] lg:mb-24"/,
  'The section header should use the tighter width and spacing from the updated composition.',
)

console.log('Curated Mentor Pool layout hooks verified.')
