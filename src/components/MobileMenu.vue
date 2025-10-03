<template>
    <div class="mobile-menu-wrapper">
        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-menu-toggle" @click="toggleMenu" :aria-label="t('aria.openMenu')" :aria-expanded="isOpen"
            type="button">
            <Icon :icon="isOpen ? 'mdi:close' : 'mdi:menu'" class="burger-icon" />
        </button>

        <!-- Mobile Menu Modal Overlay -->
        <Teleport to="body" :disabled="!isMounted">
            <div v-if="isOpen && isMounted" class="mobile-menu-overlay" @click="handleOverlayClick">
                <div class="mobile-menu-modal" @click="handleModalClick">

                    <!-- Modal Header with all controls in one row -->
                    <div class="modal-header">
                        <div v-if="hasBeenOpened" class="header-controls">
                            <LanguageSelect />
                            <ThemeToggle />
                            <button class="modal-close" @click="closeMenu" :aria-label="t('aria.closeMenu')"
                                type="button">
                                <Icon icon="mdi:close" class="close-icon" />
                            </button>
                        </div>
                        <!-- Show only close button until first opened -->
                        <button v-else class="modal-close" @click="closeMenu" :aria-label="t('aria.closeMenu')"
                            type="button">
                            <Icon icon="mdi:close" class="close-icon" />
                        </button>
                    </div>

                    <!-- Navigation Links -->
                    <nav class="modal-nav">
                        <ul class="nav-list">
                            <li v-for="link in links" :key="link.href" class="nav-item">
                                <a :href="link.href" class="nav-link" @click="handleNavLinkClick">
                                    {{ link.label }}
                                </a>
                            </li>
                        </ul>
                    </nav>

                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { Icon } from "@iconify/vue"
import ThemeToggle from "./ThemeToggle.vue"
import LanguageSelect from "./LanguageSelect.vue"
import { useClientTranslations } from "@/i18n/utils.ts"
import { closeAllDropdowns } from "@/composables/useDropdown.ts"

interface NavLink {
    href: string
    label: string
}

interface Props {
    links: NavLink[]
}

defineProps<Props>();

const isOpen = ref<boolean>(false);

/* Use client-side helper for translations */
const { t } = useClientTranslations();

/* Fix hydration issues by disabling teleport during SSR */
const isMounted = ref<boolean>(false);
const hasBeenOpened = ref<boolean>(false);

const toggleMenu = (): void => {
    isOpen.value = !isOpen.value;

    /* Mark as opened once for component loading */
    if (isOpen.value && !hasBeenOpened.value) {
        hasBeenOpened.value = true;
    }

    /* Prevent body scroll when menu is open */
    if (isOpen.value) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }
}

const closeMenu = (): void => {
    isOpen.value = false
    document.body.style.overflow = "";
}

const handleNavLinkClick = (): void => {
    // Let Astro's View Transitions handle the navigation smoothly
    closeMenu();
}

const handleOverlayClick = (): void => {
    closeAllDropdowns();
    closeMenu();
}

const handleModalClick = (event: Event): void => {
    /* Check if click is outside any dropdown areas */
    const target = event.target as HTMLElement;
    if (!target.closest(".language-select") && !target.closest(".theme-toggle")) {
        /* Close all dropdowns using modern composable */
        closeAllDropdowns();
    }
    /* Stop propagation to prevent modal from closing */
    event.stopPropagation();
}

/* Close menu on escape key */
const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && isOpen.value) {
        closeMenu();
    }
}

onMounted((): void => {
    /* Enable teleport after hydration to prevent mismatch */
    isMounted.value = true;
    document.addEventListener("keydown", handleKeydown);
})

onUnmounted((): void => {
    document.removeEventListener("keydown", handleKeydown);
    // Restore body scroll on unmount
    document.body.style.overflow = "";
})
</script>

<style scoped>
/* Wrapper to fix Astro CID inheritance */
.mobile-menu-wrapper {
    display: contents;
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
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
    position: relative;
    overflow: hidden;

    &:hover {
        background: var(--color-surface-3);
        border-color: var(--color-primary);

        .burger-icon {
            color: var(--color-primary);
        }
    }

    &:active {
        background: var(--color-surface-3);
        border-color: var(--color-primary);
        color: var(--color-primary);

        .burger-icon {
            color: var(--color-primary);
        }
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .burger-icon {
        width: var(--icon-md);
        height: var(--icon-md);
        color: var(--color-text);
    }
}

/* Modal System */
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-surface-1);
    z-index: var(--layer-modal);
    display: flex;
    flex-direction: column;
    padding: 0;
}

.mobile-menu-modal {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Modal Header */
.modal-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: var(--stack-sm) var(--gutter);
    flex-shrink: 0;
    min-height: 60px;
    /* Match header height */

    .header-controls {
        display: flex;
        align-items: center;
        gap: var(--stack-sm);
    }
}

.modal-close {
    background: var(--color-surface-2);
    border: var(--border-hairline) solid var(--color-border);
    border-radius: var(--button-radius);
    color: var(--color-text);
    cursor: pointer;
    padding: var(--stack-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);

    &:hover {
        background: var(--color-surface-3);
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    &:active {
        background: var(--color-surface-3);
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }

    .close-icon {
        width: var(--icon-md);
        height: var(--icon-md);
    }
}

/* Navigation */
.modal-nav {
    padding: 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    /* Allow flex shrinking */

    .nav-list {
        list-style: none;
        margin: 0;
        padding: var(--stack-xl);
        display: flex;
        flex-direction: column;
        gap: var(--stack-lg);
        width: 100%;
        max-width: 300px;
        /* Perfect vertical centering */
        justify-content: center;
        align-items: stretch;

        .nav-item {
            width: 100%;

            .nav-link {
                display: block;
                color: var(--color-text);
                text-decoration: none;
                font-size: var(--heading-xs);
                font-weight: var(--fw-medium);
                padding: var(--stack-lg);
                border-radius: var(--button-radius);
                text-align: center;
                border: var(--border-hairline) solid transparent;

                &:hover {
                    background: var(--color-surface-2);
                    color: var(--color-primary);
                    border-color: var(--color-border);
                }

                &:focus-visible {
                    outline: 2px solid var(--color-primary);
                    outline-offset: 2px;
                }
            }
        }
    }
}
</style>