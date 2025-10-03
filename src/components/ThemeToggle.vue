<template>
    <button class="theme-toggle" @click="toggleTheme" :aria-label="t('aria.themeSelect')" type="button">
        <div class="icon-container">
            <Transition name="icon-fade" mode="out-in">
                <!-- Show icons only after hydration to prevent flash -->
                <template v-if="isHydrated">
                    <!-- Sun Icon -->
                    <Icon v-if="!isDark" key="sun" icon="mdi:white-balance-sunny" class="theme-icon" />

                    <!-- Moon Icon -->
                    <Icon v-else key="moon" icon="mdi:brightness-3" class="theme-icon" />
                </template>

                <!-- Placeholder during hydration -->
                <div v-else key="placeholder" class="theme-icon-placeholder"></div>
            </Transition>
        </div>
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { Icon } from "@iconify/vue"
import { useClientTranslations } from "@/i18n/utils"

type Theme = "light" | "dark";  

const isDark = ref<boolean>(false);
const isHydrated = ref<boolean>(false);

const { t } = useClientTranslations();

const toggleTheme = (): void => {
    isDark.value = !isDark.value;
    const theme: Theme = isDark.value ? "dark" : "light";

    // Set theme attribute immediately (no flickering)
    document.documentElement.setAttribute("data-theme", theme);

    // Set cookie for SSR (expires in 1 year)
    const maxAge = 60 * 60 * 24 * 365;// 1 year in seconds
    document.cookie = `theme=${theme}; Max-Age=${maxAge}; path=/; SameSite=Lax; Secure`;
}

onMounted((): void => {
    // Get current theme from DOM (set by SSR)
    const currentTheme = document.documentElement.getAttribute("data-theme") as Theme | null;

    // Set state without triggering reactivity during hydration
    isDark.value = currentTheme === "dark";

    // Mark as hydrated to show icons
    isHydrated.value = true;
});
</script>



<style scoped>
.theme-toggle {
    background: var(--grad-surface-soft);
    border: var(--border-hairline) solid var(--color-border-hairline);
    border-radius: var(--button-radius);
    box-shadow: var(--elev-1);
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);
    padding: 0;
    transition: all var(--dur-2) var(--ease-standard);
    position: relative;
    overflow: hidden;

    &:hover {
        background: var(--color-surface-3);
        transform: scale(var(--scale-hover));
        border-color: var(--color-primary);

        .icon-container {
            .theme-icon {
                color: var(--color-primary);
            }
        }
    }

    &:active {
        transform: scale(var(--scale-active));
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    .icon-container {
        position: relative;
        width: var(--icon-md);
        height: var(--icon-md);

        .theme-icon {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: var(--color-text);
            transition: color var(--dur-2) var(--ease-standard);
        }

        /* Placeholder to prevent layout shift */
        .theme-icon-placeholder {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
        }

        /* Transition Component Styles */
        .icon-fade {

            &-enter-active,
            &-leave-active {
                transition: all var(--dur-2) var(--ease-standard);
            }

            &-enter-from {
                opacity: 0;
                transform: rotate(180deg) scale(0.5);
            }

            &-leave-to {
                opacity: 0;
                transform: rotate(-180deg) scale(0.5);
            }

            &-enter-to,
            &-leave-from {
                opacity: 1;
                transform: rotate(0deg) scale(1);
            }
        }
    }
}
</style>