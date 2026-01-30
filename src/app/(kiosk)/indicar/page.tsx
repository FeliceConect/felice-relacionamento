'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useIndicar } from '@/lib/hooks/useIndicar'
import {
  IndicarSelecionarProfissional,
  IndicarBuscaPaciente,
  IndicarCartaFormulario,
  IndicarAgradecimento,
} from '@/components/kiosk/indicar'

export default function IndicarPage() {
  const {
    state,
    selectProfissional,
    setSearchQuery,
    selectPaciente,
    goBack,
    updateIndicacao,
    addIndicacao,
    removeIndicacao,
    submitIndicacoes,
    reset,
    indicacoesPreenchidas,
    canSubmit,
  } = useIndicar()

  return (
    <AnimatePresence mode="wait">
      {state.step === 'profissional' && (
        <motion.div
          key="profissional"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IndicarSelecionarProfissional
            profissionais={state.profissionais}
            isLoading={state.isLoadingProfissionais}
            onSelectProfissional={selectProfissional}
          />
        </motion.div>
      )}

      {state.step === 'search' && (
        <motion.div
          key="search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IndicarBuscaPaciente
            searchQuery={state.searchQuery}
            searchResults={state.searchResults}
            isSearching={state.isSearching}
            selectedPaciente={state.paciente}
            onSearchChange={setSearchQuery}
            onSelectPaciente={selectPaciente}
            onBack={goBack}
            profissionalNome={state.profissional?.nome}
          />
        </motion.div>
      )}

      {state.step === 'form' && state.paciente && (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IndicarCartaFormulario
            nomePaciente={state.paciente.nome}
            indicacoes={state.indicacoes}
            indicacoesPreenchidas={indicacoesPreenchidas}
            isSubmitting={state.isSubmitting}
            error={state.error}
            canSubmit={canSubmit}
            onUpdateIndicacao={updateIndicacao}
            onAddIndicacao={addIndicacao}
            onRemoveIndicacao={removeIndicacao}
            onSubmit={submitIndicacoes}
            onBack={goBack}
          />
        </motion.div>
      )}

      {state.step === 'success' && state.paciente && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IndicarAgradecimento
            nomePaciente={state.paciente.nome}
            quantidadeIndicacoes={indicacoesPreenchidas}
            onReset={reset}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
