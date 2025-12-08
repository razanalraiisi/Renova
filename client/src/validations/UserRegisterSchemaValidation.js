import * as yup from "yup";

export const UserRegisterSchemaValidation = yup.object().shape({
  uname: yup
    .string()
    .required("Name / Company name is required")
    .matches(/^[A-Za-z ]+$/, "Letters only")
    .max(50, "Maximum 50 characters"),

  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(4, "Minimum 4 characters")
    .max(10, "Maximum 10 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain one special character"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[279]\d{7}$/, "Omani number: 8 digits & starts with 2, 7 or 9"),

  pic: yup
    .string()
    .required("Profile picture URL is required"),
});
