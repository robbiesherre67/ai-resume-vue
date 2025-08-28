<script setup lang="ts">
import { ref } from "vue";

type Tone = "concise" | "leadership" | "impact";

const job = ref("");
const tone = ref<Tone>("impact");
const out = ref("");
const loading = ref(false);
const copied = ref(false);

// define tones in script (so we don't need "as Tone" in the template)
const tones: Tone[] = ["impact", "leadership", "concise"];

async function run() {
  if (!job.value || job.value.trim().length < 50) {
    alert("Please paste a job description with at least 50 characters.");
    return;
  }
  loading.value = true;
  out.value = "Thinking…";
  copied.value = false;
  try {
    const res = await fetch("/api/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: job.value, tone: tone.value })
    });
    const data = await res.json();
    out.value = data.bullets || data.error || "No output.";
  } catch (e: any) {
    out.value = e?.message || "Unexpected error.";
  } finally {
    loading.value = false;
  }
}

async function copyResult() {
  if (!out.value || out.value === "Thinking…") return;
  try {
    await navigator.clipboard.writeText(out.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {}
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-14">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-semibold tracking-tight">AI Résumé Assistant</h1>
      <p class="mt-2 text-slate-600">
        Paste a job description and generate tailored, impact-focused bullets from your experience.
      </p>
    </div>

    <!-- Card -->
    <div class="card p-6 md:p-8">
      <label class="block text-sm font-medium text-slate-700">Job Description</label>
      <textarea
        v-model="job"
        rows="10"
        placeholder="Paste the job description here (50+ chars)…"
        class="input mt-2"
      />

      <!-- Tone + Action -->
      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-700">Tone</span>
          <div class="inline-flex rounded-xl border border-slate-300/80 bg-white p-1">
            <button
              v-for="t in tones"
              :key="t"
              @click="tone = t"
              class="px-3 py-1.5 text-sm rounded-lg transition"
              :class="tone === t ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'"
            >
              {{ t.charAt(0).toUpperCase() + t.slice(1) }}
            </button>
          </div>
        </div>

        <button @click="run" :disabled="loading" class="btn-primary px-4 py-2">
          <span v-if="loading" class="inline-flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
            </svg>
            Generating…
          </span>
          <span v-else>Tailor my bullets</span>
        </button>
      </div>

      <!-- Result -->
      <div class="mt-6">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">Result</h2>
          <button
            @click="copyResult"
            :disabled="!out || out === 'Thinking…'"
            class="btn-ghost px-3 py-1.5"
            title="Copy result"
          >
            {{ copied ? "Copied!" : "Copy" }}
          </button>
        </div>

        <div class="mt-3 rounded-xl border border-slate-200/80 bg-white p-4">
          <article class="prose-wrap">
            <template v-if="out">
              {{ out }}
            </template>
            <template v-else>
              <span class="text-slate-400">Your tailored bullets will appear here…</span>
            </template>
          </article>
        </div>
      </div>

      <p class="mt-4 text-xs text-slate-500">
        Tip: Keep snippets in <code>data/resume.json</code> short and metric-driven for best results.
      </p>
    </div>

    <div class="mt-6 text-center text-xs text-slate-500">
      Built with Vue 3 + Vite + TailwindCSS.
    </div>
  </div>
</template>