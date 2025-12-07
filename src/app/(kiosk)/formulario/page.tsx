'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useFormulario } from '@/lib/hooks/useFormulario'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  FormularioWelcome,
  FormularioQuestion,
  FormularioContact,
  FormularioSuccess,
} from '@/components/kiosk'

export default function FormularioPage() {
  const {
    state,
    perguntas,
    isLoading,
    startForm,
    nextQuestion,
    prevQuestion,
    selectOption,
    setNome,
    setWhatsapp,
    submitForm,
    resetForm,
    progress,
    currentPergunta,
    canGoNext,
    canSubmit,
  } = useFormulario()

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    )
  }

  if (perguntas.length === 0 && state.step === 'questions') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-butler text-2xl text-cafe mb-2">
            Formulário em configuração
          </h2>
          <p className="font-sarabun text-cafe/70">
            As perguntas ainda não foram cadastradas. Por favor, volte mais tarde.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {state.step === 'welcome' && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FormularioWelcome onStart={startForm} />
        </motion.div>
      )}

      {state.step === 'questions' && currentPergunta && (
        <motion.div
          key={`question-${currentPergunta.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FormularioQuestion
            pergunta={currentPergunta}
            selectedOptions={state.answers[currentPergunta.id] || []}
            progress={progress}
            currentIndex={state.currentQuestion}
            totalQuestions={perguntas.length}
            canGoNext={canGoNext}
            onSelectOption={(opcaoId) =>
              selectOption(currentPergunta.id, opcaoId, currentPergunta.multipla_selecao)
            }
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />
        </motion.div>
      )}

      {state.step === 'contact' && (
        <motion.div
          key="contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FormularioContact
            nome={state.nome}
            whatsapp={state.whatsapp}
            isSubmitting={state.isSubmitting}
            error={state.error}
            canSubmit={canSubmit}
            onNomeChange={setNome}
            onWhatsappChange={setWhatsapp}
            onSubmit={submitForm}
            onPrev={() => {
              // Voltar para última pergunta
              if (perguntas.length > 0) {
                prevQuestion()
              }
            }}
          />
        </motion.div>
      )}

      {state.step === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FormularioSuccess nome={state.nome} onReset={resetForm} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
