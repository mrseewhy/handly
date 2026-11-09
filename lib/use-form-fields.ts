"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Shared validation state for the app's forms (sign in/up, reset, contact,
 * create ticket, settings). Each of those hand-rolled the same
 * touched → valid → error → canSubmit logic; this keeps the rules in one place.
 *
 * Validation is derived, not stored: a field only shows an error once the user
 * has interacted with it (or after a submit attempt), which avoids shouting at
 * someone who has not typed anything yet.
 */

export interface FieldRule {
  /** Returns an error message, or null when the value is acceptable. */
  validate: (value: string) => string | null;
}

export interface UseFormFieldsOptions {
  /** Field name → validation rule. */
  rules: Record<string, FieldRule>;
  /** Starting values. Fields missing here start as "". */
  initial?: Record<string, string>;
}

export interface UseFormFieldsResult {
  values: Record<string, string>;
  /** Error per field, already filtered by touched/submitted state. */
  errors: Record<string, string | null>;
  setValue: (name: string, value: string) => void;
  /** Marks a field as touched so its error can surface. */
  touch: (name: string) => void;
  /** Marks every field touched (call on submit). */
  touchAll: () => void;
  /** True when every field passes validation. */
  isValid: boolean;
  reset: () => void;
}

export function useFormFields({
  rules,
  initial = {},
}: UseFormFieldsOptions): UseFormFieldsResult {
  const names = useMemo(() => Object.keys(rules), [rules]);

  const initialValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const name of names) values[name] = initial[name] ?? "";
    return values;
  }, [names, initial]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const touch = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const touchAll = useCallback(() => {
    setSubmitted(true);
    setTouched(Object.fromEntries(names.map((n) => [n, true])));
  }, [names]);

  const errors = useMemo(() => {
    const result: Record<string, string | null> = {};
    for (const name of names) {
      const visible = submitted || touched[name];
      result[name] = visible ? rules[name].validate(values[name] ?? "") : null;
    }
    return result;
  }, [names, rules, values, touched, submitted]);

  const isValid = useMemo(
    () => names.every((name) => rules[name].validate(values[name] ?? "") === null),
    [names, rules, values],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setSubmitted(false);
  }, [initialValues]);

  return { values, errors, setValue, touch, touchAll, isValid, reset };
}

/* ------------------------------------------------------------------ */
/* Reusable rules                                                      */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export const rules = {
  email: (message = "Enter a valid email address."): FieldRule => ({
    validate: (value) => (isEmail(value.trim()) ? null : message),
  }),
  required: (message: string): FieldRule => ({
    validate: (value) => (value.trim().length > 0 ? null : message),
  }),
  minLength: (length: number, message: string): FieldRule => ({
    validate: (value) => (value.trim().length >= length ? null : message),
  }),
  /** Select-style field: any non-empty value is accepted. */
  choice: (message: string): FieldRule => ({
    validate: (value) => (value !== "" ? null : message),
  }),
};
