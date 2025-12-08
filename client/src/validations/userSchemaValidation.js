import * as yup from "yup";

export const UserSchemaValidation = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("You cannot leave the email blank"),

  password: yup
    .string()
    .required("Password must not be entered blank")
    .min(4, "Minimum 4 characters")
    .max(10, "Maximum 10 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Must contain one special character"),
});
