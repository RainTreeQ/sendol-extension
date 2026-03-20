import { useState, useEffect } from 'react'
import { X, ArrowRight, Check } from 'lucide-react'
import { t } from '@/lib/i18n'

const STORAGE_KEY = 'aib_onboarding_completed'

const steps = [
  {
    title: '欢迎使用 Sendol',
    description: '一键将消息广播到多个 AI 平台，提升你的工作效率。',
    icon: '👋'
  },
  {
    title: '打开 AI 平台',
    description: '先在浏览器中打开 ChatGPT、Claude、Gemini 等你想使用的 AI 平台。',
    icon: '🌐'
  },
  {
    title: '选择平台',
    description: 'Sendol 会自动检测已打开的 AI 标签页，勾选你想发送的平台。',
    icon: '✓'
  },
  {
    title: '输入并发送',
    description: '输入你的消息，按 Ctrl+Enter 一键广播到所有选中的平台。',
    icon: '🚀'
  },
  {
    title: '自动发送',
    description: '开启"自动发送"后，消息会自动提交，无需手动点击每个平台的按钮。',
    icon: '⚡'
  }
]

export function Onboarding({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const checkOnboarding = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY)
        if (!result[STORAGE_KEY]) {
          setIsVisible(true)
        }
      } catch {
        // If storage fails, still show onboarding
        setIsVisible(true)
      }
    }
    checkOnboarding()
  }, [])

  const handleClose = async () => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: true })
    } catch (err) {
      console.error('Failed to save onboarding state:', err)
    }
    setIsVisible(false)
    onClose?.()
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  if (!isVisible) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[360px] max-w-[90vw] rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-800">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 text-center text-5xl">{step.icon}</div>

        {/* Content */}
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {step.title}
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-black dark:bg-white'
                  : index < currentStep
                  ? 'bg-gray-400 dark:bg-zinc-500'
                  : 'bg-gray-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <>
              <button
                onClick={handleSkip}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                跳过
              </button>
              <button
                onClick={handleNext}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-black py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-black py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Check className="h-4 w-4" />
              开始使用
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
