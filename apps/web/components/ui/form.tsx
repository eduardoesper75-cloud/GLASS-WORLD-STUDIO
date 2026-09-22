'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  OptionHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

/* Campo con etiqueta + control + pista técnica en mono. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn('gw-field', className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <span className="gw-field__hint" role="alert" style={{ color: 'var(--sat-glow)' }}>
          {error}
        </span>
      ) : hint ? (
        <span className="gw-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function Label({
  required,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('gw-field__label', className)} {...props}>
      {props.children}
      {required && <span aria-hidden="true" style={{ color: 'var(--sat-glow)' }}> *</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn('gw-input', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn('gw-select', className)} {...props}>
      {children}
    </select>
  );
});

export const SelectOption = forwardRef<HTMLOptionElement, OptionHTMLAttributes<HTMLOptionElement>>(function SelectOption(props, ref) {
  return <option ref={ref} {...props} />;
});

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn('gw-checkbox', className)}
      style={{ accentColor: 'var(--galaxy-core, var(--g2-core))', width: 16, height: 16 }}
      {...props}
    />
  );
}

export function FacetedButton({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button type="button" className={cn('gw-tab', active && 'gw-tab--active', className)} aria-pressed={active} {...props} />;
}