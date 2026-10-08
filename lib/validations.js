import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  businessName: yup
    .string()
    .trim()
    .required("Business or store name is required")
    .min(2, "Business name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Please provide a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(1, "Password cannot be empty"),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required("Registered email is required")
    .email("Enter a valid email address"),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export const invoiceCreateSchema = yup.object().shape({
  amountFiat: yup
    .number()
    .typeError("Please enter a valid numeric amount")
    .positive("Amount must be greater than zero")
    .required("Invoice fiat amount is required"),
  fiatCurrency: yup.string().default("USD"),
  asset: yup.string().required("Please select a cryptocurrency asset"),
  customerEmail: yup
    .string()
    .trim()
    .email("Enter a valid customer email")
    .optional(),
  customerRef: yup.string().trim().optional(),
  webhookEndpoint: yup
    .string()
    .trim()
    .url("Must be a valid webhook URL (http/https)")
    .optional(),
});
