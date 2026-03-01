import { useState, useEffect, useRef } from 'react';

/**
 * useAnimatedCounter
 * Smoothly counts from 0 to `target` over `duration` ms using easeOutExpo.
 * @param {number} target     — final value
 * @param {number} duration   — animation duration in ms (default 1200)
 * @param {boolean} start     — set to true to trigger the animation (default true)
 */
export default function useAnimatedCounter(target, duration = 1200, start = true) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const startValue = 0;

        const easeOutExpo = (t) =>
            t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(startValue + (target - startValue) * eased);
            setValue(current);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration, start]);

    return value;
}
