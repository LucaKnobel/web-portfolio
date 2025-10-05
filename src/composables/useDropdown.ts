import { ref, onMounted, onUnmounted } from "vue";

// Global dropdown manager
const openDropdowns = new Set<() => void>();

export function useDropdown() {
    const isOpen = ref(false);
    
    const open = () => {
        isOpen.value = true;
        openDropdowns.add(close);
    }
    
    const close = () => {
        isOpen.value = false;
        openDropdowns.delete(close);
    }
    
    const toggle = () => {
        if (isOpen.value) {
            close();
        } else {
            open();
        }
    }
    
    onUnmounted(() => {
        openDropdowns.delete(close);
    })
    
    return {
        isOpen,
        open,
        close,
        toggle
    }
}

export function closeAllDropdowns() {
    openDropdowns.forEach(close => close())
}

/* Click-outside composable */
export function useClickOutside(
    elementRef: { value: HTMLElement | null },
    callback: () => void
) {
    const handleClick = (event: Event) => {
        const target = event.target as HTMLElement
        if (elementRef.value && !elementRef.value.contains(target)) {
            callback();
        }
    }
    
    onMounted(() => {
        document.addEventListener("click", handleClick);
    })
    
    onUnmounted(() => {
        document.removeEventListener("click", handleClick);
    })
}