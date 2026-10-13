import { Field } from '@base-ui/react/field'
import { Input } from '@base-ui/react/input'
import './filters.css'

export function HeaderSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field.Root className="filter-search">
      <span className="material-symbols-rounded" aria-hidden="true">search</span>
      <Field.Label className="visually-hidden">Search the vault</Field.Label>
      <Input value={value} onValueChange={onChange} placeholder="Search the vault" />
      <kbd aria-hidden="true">/</kbd>
    </Field.Root>
  )
}
