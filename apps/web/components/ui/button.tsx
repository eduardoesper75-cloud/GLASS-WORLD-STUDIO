'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

const VARIANTS: Record<ButtonVariant, string> = {
  default: 'gw-btn',
  primary: 'gw-btn gw-btn--primary',
  ghost: 'gw-btn gw-btn--ghost',
  danger: 'gw-btn gw-btn--danger',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', block = false, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(VARIANTS[variant], block && 'gw-btn--block', className)} {...props}>
      {children}
    </button>
  );
});

export interface ButtonLinkProps {
  variant?: ButtonVariant;
  block?: boolean;
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}

export function ButtonLink({ variant = 'default', block = false, href, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(VARIANTS[variant], block && 'gw-btn--block', className)} {...rest}>
      {children}
    </Link>
  );
}