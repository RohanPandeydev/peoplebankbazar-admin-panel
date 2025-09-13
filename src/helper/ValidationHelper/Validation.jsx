import * as Yup from "yup";

export const LoginFormValidation = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

// ✅ Validation Schema
export const CategoryFormValidation = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  slug: Yup.string().required("Slug is required"),
  category_type: Yup.string().required("Category Type is required"),
  image: Yup.mixed().required("Category image is required"),
});
export const BankFormValidation = Yup.object().shape({
  name: Yup.string().required("Bank name is required"),
  slug: Yup.string().required("Slug is required"),
  official_website: Yup.string().url("Must be a valid URL").nullable(),
  email: Yup.string().email("Must be a valid email").nullable(),
  logo: Yup.mixed().required("Bank logo is required"),
});

export const PromotionalFormValidation = Yup.object().shape({
  title: Yup.string()
    .max(255, "Title must be at most 255 characters")
    .required("Title is required"),
  main_text: Yup.string()
    .max(500, "Main Text must be at most 500 characters")
    .required("Main Text is required"),
  subtitle: Yup.string().max(255, "Subtitle must be at most 255 characters"),
  card_type: Yup.string()
    .oneOf(
      ["investment", "insurance", "calculator", "loan", "other"],
      "Invalid card type"
    )
    .required("Card type is required"),
  background_color: Yup.string().max(
    50,
    "Background color must be at most 50 characters"
  ),
  button_text: Yup.string().max(
    100,
    "Button text must be at most 100 characters"
  ),
  button_url: Yup.string().url("Invalid URL format"),
  button_action: Yup.string().oneOf(
    ["url", "modal", "calculator", "form", "phone"],
    "Invalid button action"
  ),
  discount_percentage: Yup.number()
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount cannot exceed 100%")
    .nullable(),
  badge_text: Yup.string().max(
    100,
    "Badge text must be at most 100 characters"
  ),
  badge_color: Yup.string().max(
    50,
    "Badge color must be at most 50 characters"
  ),
  category_id: Yup.number().nullable(),
  target_audience: Yup.string().oneOf(
    ["all", "new_users", "existing_users", "premium_users"],
    "Invalid target audience"
  ),
  display_conditions: Yup.string(), // can parse JSON later
  metadata: Yup.string(), // can parse JSON later
  start_date: Yup.date().nullable(),
  end_date: Yup.date()
    .nullable()
    .min(Yup.ref("start_date"), "End date cannot be before start date"),
  image: Yup.mixed().required("Image is required"),
});

export const AlsoBuyFormValidation = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .nullable(),

  link_url: Yup.string().trim().url("Enter a valid URL").nullable(),

  discount_percentage: Yup.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .nullable(),

  discount_text: Yup.string()
    .trim()
    .max(50, "Discount text cannot exceed 50 characters")
    .nullable(),

  badge_text: Yup.string()
    .trim()
    .max(30, "Badge text cannot exceed 30 characters")
    .nullable(),

  // Accepts hex (#fff or #ffffff) OR simple color names (letters and spaces)
  badge_color: Yup.string()
    .trim()
    .matches(
      /^(#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})|[A-Za-z\s]+)$/,
      "Invalid color (use hex like #00ff00 or a color name)"
    )
    .required("Badge color is required"),

  bank_id: Yup.number()
    .typeError("Bank is required")
    .required("Please select a bank"),

  category_id: Yup.number()
    .typeError("Category is required")
    .required("Please select a category"),

  sort_order: Yup.number().min(0, "Sort order cannot be negative").nullable(),

  is_active: Yup.boolean(),
  is_featured: Yup.boolean(),

  // image required conditionally using context: { isEdit: true/false }
  image: Yup.mixed().required("Image is required"),
});

export const CmsFormValidation = (pageType) =>
  Yup.object().shape({
    title: Yup.string().required("Title is required"),
    subtitle: Yup.string().nullable(),
    category_id: Yup.string().required("Category is required"),
    bank_id:
      pageType === "bank_detail"
        ? Yup.string().required("Bank is required")
        : Yup.string().nullable(),
    slider_images: Yup.array()
      .min(1, "At least one slider image is required")
      .required("Slider images are required"),
    is_active: Yup.boolean().default(true),
  });
