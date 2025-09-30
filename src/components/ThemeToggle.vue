<template>
  <button 
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="`Switch to ${nextTheme} theme`"
    type="button"
  >
    <div class="icon-container">
      <Transition name="icon-fade" mode="out-in">
        <!-- Sun Icon -->
        <svg 
          v-if="!isDark" 
          key="sun" 
          class="theme-icon"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        
        <!-- Moon Icon -->
        <svg 
          v-else 
          key="moon" 
          class="theme-icon"
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </Transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isDark = ref(false)
const nextTheme = computed(() => isDark.value ? 'light' : 'dark')

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  
  // Set theme attribute immediately (no flickering)
  document.documentElement.setAttribute('data-theme', theme)
  
  // Set cookie for SSR (expires in 1 year)
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `theme=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  
}

onMounted(() => {
  // Get current theme from DOM (set by SSR)
  const currentTheme = document.documentElement.getAttribute('data-theme')
  isDark.value = currentTheme === 'dark'
})
</script>

<style scoped>


.theme-toggle {
  background: var(--color-surface-2);
  border: var(--border-hairline) solid var(--color-border);
  border-radius: var(--button-radius);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: var(--stack-xs);
  transition: all var(--dur-2) var(--ease-standard);
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  background: var(--color-surface-3);
  transform: scale(var(--scale-hover));
  border-color: var(--color-border-focus);
}

.theme-toggle:active {
  transform: scale(var(--scale-active));
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.icon-container {
  position: relative;
  width: var(--icon-md);
  height: var(--icon-md);
}

.theme-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: var(--color-text);
  transition: color var(--dur-2) var(--ease-standard);
}

.theme-toggle:hover .theme-icon {
  color: var(--color-primary);
}

/* Icon transition animations */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all var(--dur-3) var(--ease-standard);
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.icon-fade-enter-to,
.icon-fade-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

/* Disabled state */
.theme-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
</style>