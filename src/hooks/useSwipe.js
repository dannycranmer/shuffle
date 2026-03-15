import { useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.5

export default function useSwipe(onSwipe) {
  const touchStart = useRef(null)
  const touchStartTime = useRef(null)
  const currentTranslate = useRef(0)
  const elementRef = useRef(null)

  const onTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    currentTranslate.current = 0
    if (elementRef.current) {
      elementRef.current.style.transition = 'none'
    }
  }, [])

  const onTouchMove = useCallback((e) => {
    if (touchStart.current === null) return
    const diff = e.touches[0].clientX - touchStart.current
    currentTranslate.current = diff
    if (elementRef.current) {
      const rotate = diff * 0.1
      const opacity = Math.max(0.5, 1 - Math.abs(diff) / 400)
      elementRef.current.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`
      elementRef.current.style.opacity = opacity
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (touchStart.current === null) return
    const diff = currentTranslate.current
    const elapsed = Date.now() - touchStartTime.current
    const velocity = Math.abs(diff) / elapsed

    const swiped = Math.abs(diff) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD

    if (swiped && elementRef.current) {
      // Fly off screen
      const direction = diff > 0 ? 1 : -1
      elementRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
      elementRef.current.style.transform = `translateX(${direction * window.innerWidth}px) rotate(${direction * 30}deg)`
      elementRef.current.style.opacity = '0'
      setTimeout(() => {
        onSwipe()
        if (elementRef.current) {
          elementRef.current.style.transition = 'none'
          elementRef.current.style.transform = ''
          elementRef.current.style.opacity = ''
          // Snap back in from opposite side
          requestAnimationFrame(() => {
            if (elementRef.current) {
              elementRef.current.style.transform = `translateX(${-direction * 50}px)`
              elementRef.current.style.opacity = '0'
              requestAnimationFrame(() => {
                if (elementRef.current) {
                  elementRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
                  elementRef.current.style.transform = ''
                  elementRef.current.style.opacity = '1'
                }
              })
            }
          })
        }
      }, 300)
    } else if (elementRef.current) {
      // Snap back
      elementRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
      elementRef.current.style.transform = ''
      elementRef.current.style.opacity = '1'
    }

    touchStart.current = null
    touchStartTime.current = null
    currentTranslate.current = 0
  }, [onSwipe])

  return { elementRef, onTouchStart, onTouchMove, onTouchEnd }
}
