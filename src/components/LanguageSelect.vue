<template>
    <div class="language-select" ref="languageSelectRef">
        <button 
            class="language-toggle" 
            @click="toggleDropdown" 
            :aria-label="t('aria.languageSelect')"
            :aria-expanded="isOpen"
            type="button"
        >
            <Icon icon="mdi:translate" class="language-icon" />
        </button>
        
        <Transition name="dropdown">
            <div v-if="isOpen" class="dropdown">
                <button 
                    v-for="language in availableLanguages" 
                    :key="language.code"
                    class="language-option"
                    :class="{ 'active': language.code === currentLang }"
                    @click="switchLanguage(language.code)"
                    type="button"
                >
                    <span class="label">{{ language.label }}</span>
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { Icon } from "@iconify/vue"
import { languages as languageConfig } from "@/i18n/ui"
import { useClientTranslations } from "@/i18n/utils"
import { useDropdown, useClickOutside } from "@/composables/useDropdown"

interface Language {
    code: string
    label: string
}

const { lang, t } = useClientTranslations();
const currentLang = ref<string>(lang);

/* Use modern dropdown composable instead of manual state */
const { isOpen, toggle: toggleDropdown, close } = useDropdown();

/* Click-outside with template ref */
const languageSelectRef = ref<HTMLElement | null>(null)
useClickOutside(languageSelectRef, close)

/* Transform language config into dropdown options */
const availableLanguages = computed<Language[]>(() => {
    return Object.entries(languageConfig).map(([code, label]) => ({
        code,
        label
    }))
});

const switchLanguage = (newLang: string): void => {
    if (newLang === currentLang.value) {
        close();
        return;
    }
    
    /* Get current path without language prefix and preserve route structure */
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}/, "") || "/";

    /* Navigate to new language URL while preserving the current page */
    const newUrl = `/${newLang}${pathWithoutLang}`;
    window.location.href = newUrl;
}
</script>

<style scoped>
.language-select {
    position: relative;
    display: inline-block;
}

.language-toggle {
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

        .language-icon {
            color: var(--color-primary);
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

    .language-icon {
        width: var(--icon-md);
        height: var(--icon-md);
        color: var(--color-text);
        transition: color var(--dur-2) var(--ease-standard);
    }
}

.dropdown {
    position: absolute;
    top: calc(100% + var(--stack-xs));
    left: 50%;
    transform: translateX(-50%);
    min-width: 120px;
    background: var(--color-surface-2);
    border: var(--border-hairline) solid var(--color-border-hairline);
    border-radius: var(--button-radius);
    box-shadow: var(--elev-3);
    overflow: hidden;
    z-index: var(--layer-tooltip);
    max-height: 50vh;
    overflow-y: auto;
}

.language-option {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--stack-sm);
    transition: all var(--dur-2) var(--ease-standard);
    
    &:hover {
        background: var(--color-surface-3);
        
        .label {
            color: var(--color-primary);
        }
    }
    
    &.active {
        background: var(--color-surface-3);
        color: var(--color-primary);
        
        .label {
            color: var(--color-primary);
        }
    }
    
    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
    }
    
    .label {
        font-size: var(--text-small);
        font-weight: var(--fw-medium);
        transition: color var(--dur-2) var(--ease-standard);
    }
}

/* Dropdown transition animations */
.dropdown-enter-active {
    transition: all var(--dur-2) var(--ease-standard);
    transform-origin: top;
}

.dropdown-leave-active {
    transition: all var(--dur-2) var(--ease-standard);
    transform-origin: top;
}

.dropdown-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.96);
}

.dropdown-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px) scale(0.96);
}

.dropdown-enter-to,
.dropdown-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
}
</style>
