import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Alert,
  Card,
  CardBody,
  CardHeader,
} from "reactstrap";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CmsServices from "../../services/CmsServices";
import CategoryServices from "../../services/CategoryServices";
import BankServices from "../../services/BankServices"; // 🔹 NEW (API for banks)
import ButtonLoader from "../../utils/Loader/ButtonLoader";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { CmsFormValidation } from "../../helper/ValidationHelper/Validation";
import { buildQueryString } from "../../utils/BuildQuery";

const CmsForm = ({ title }) => {
  const { id } = useParams();
  const location = useLocation(); // 🔹 for detecting page type from URL
  const [pageType, setPageType] = useState("");
  const [serverError, setServerError] = useState("");
  const [cmsImg, setCmsImg] = useState(null);
  const [showCmsImg, setShowCmsImg] = useState(null);
  const [cmsImgErr, setCmsImgErr] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null); // 🔹 NEW
  const [banks, setBanks] = useState([]); // 🔹 NEW
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const isEdit = Boolean(id);

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png", ".webp"];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  // 🔹 Detect pageType from URL
  useEffect(() => {
    if (location.pathname.includes("bank-details")) {
      setPageType("bank_detail");
    } else if (location.pathname.includes("category-listing")) {
      setPageType("category_listing");
    }
  }, [location]);

  const initialValues = {
    title: "",
    subtitle: "",
    content: "",
    category_id: "",
    bank_id: "", // 🔹 add bank_id
    is_active: true,
    image: "",
  };

 const formik = useFormik({
  initialValues,
  validationSchema: CmsFormValidation(pageType), // 👈 pass pageType
  enableReinitialize: true,
  onSubmit: (values) => {
    setServerError("");
    submitHandler(values);
  },
});


  // Fetch CMS content for editing
  const { data: cmsData, isLoading: isLoadingCms, error: cmsFetchError } =
    useQuery({
      queryKey: ["cms-detail", id],
      queryFn: () => CmsServices.getCmsContentById(id),
      enabled: isEdit,
    });

  // Load categories
  const loadCategoryOptions = async (inputValue) => {
    try {
      const params = buildQueryString([
        { key: "page", value: 1 },
        { key: "limit", value: 50 },
        { key: "search", value: inputValue },
        { key: "is_active", value: true },
      ]);

      const response = await CategoryServices.categoryList(params);
      const categories = response?.categories || [];

      return categories.map((cat) => ({
        value: cat.id,
        label: (
          <div className="d-flex align-items-center gap-2">
            {cat.image_url && (
              <img
                src={
                  cat.image_url.startsWith("http")
                    ? cat.image_url
                    : `/uploads/${cat.image_url}`
                }
                alt={cat.name}
                style={{ width: 25, height: 25, borderRadius: "4px" }}
              />
            )}
            <div>
              <div>{cat.name}</div>
              {cat.subtitle && (
                <small className="text-muted">{cat.subtitle}</small>
              )}
            </div>
          </div>
        ),
        raw: cat,
      }));
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  };

  // 🔹 Fetch banks when category is selected
  useEffect(() => {
    if (selectedCategory && pageType === "bank_detail") {
      BankServices.getBanksByCategory(selectedCategory.value)
        .then((res) => {
          setBanks(res?.banks || []);
        })
        .catch((err) => {
          console.error("Error fetching banks:", err);
        });
    }
  }, [selectedCategory, pageType]);

  useEffect(() => {
    if (cmsData && isEdit) {
      const cms = cmsData.data || cmsData;

      formik.setValues({
        title: cms.title || "",
        subtitle: cms.subtitle || "",
        content: cms.content || "",
        category_id: cms.category_id || "",
        bank_id: cms.bank_id || "",
        is_active: cms.is_active ?? true,
        image: "",
      });

      if (cms.category) {
        setSelectedCategory({
          value: cms.category.id,
          label: cms.category.name,
          raw: cms.category,
        });
      }

      if (cms.bank) {
        setSelectedBank({
          value: cms.bank.id,
          label: cms.bank.name,
          raw: cms.bank,
        });
      }

      if (cms.image_url) {
        setShowCmsImg(
          cms.image_url.startsWith("http")
            ? cms.image_url
            : `/uploads/${cms.image_url}`
        );
      }
    }
  }, [cmsData, isEdit]);

  const handleImage = (e) => {
    const file = e?.target?.files?.[0];
    setCmsImgErr("");
    setCmsImg(null);
    setShowCmsImg(null);

    if (!file) {
      formik.setFieldValue("image", "");
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensionsImage.includes("." + ext)) {
      const errorMsg = `Invalid file type. Only ${allowedExtensionsImage.join(
        ", "
      )} allowed`;
      setCmsImgErr(errorMsg);
      formik.setFieldError("image", errorMsg);
      return;
    }
    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${maxFileSize / (1024 * 1024)
        }MB`;
      setCmsImgErr(errorMsg);
      formik.setFieldError("image", errorMsg);
      return;
    }

    setCmsImg(file);
    setShowCmsImg(URL.createObjectURL(file));
    formik.setFieldValue("image", file);
  };

  const submitHandler = (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key !== "image") {
          formData.append(key, data[key]);
        }
      });

      formData.append("page_type", pageType || "custom");
      formData.append("section_name", "hero_slider");

      if (cmsImg) {
        formData.append("image", cmsImg);
      }

      if (isEdit) {
        CmsUpdateMutation.mutate(formData);
      } else {
        CmsCreateMutation.mutate(formData);
      }
    } catch (err) {
      console.error(err);
      setServerError("Failed to prepare form data");
    }
  };

  const resetFormState = () => {
    formik.resetForm();
    setCmsImg(null);
    setCmsImgErr("");
    setShowCmsImg(null);
    setSelectedCategory(null);
    setSelectedBank(null);
    setServerError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const CmsCreateMutation = useMutation({
    mutationFn: (formData) => CmsServices.createCmsContent(formData),
    onSuccess: () => {
      Swal.fire({
        title: "Success",
        text: "CMS content created",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      resetFormState();
      queryClient.invalidateQueries(["cms-list"]);
      navigate(
        pageType === ""
          ? "/cms/content"
          : pageType === "bank_detail"
            ? "/cms/bank-details"
            : pageType === "category_listing"
              ? "/cms/category-listing"
              : "/cms/content" // default fallback
      );
    },
    onError: (err) => {
      console.error(err?.response?.data);
      setServerError(err?.response?.data || "Failed to create CMS content");
    },
  });

  const CmsUpdateMutation = useMutation({
    mutationFn: (formData) => CmsServices.updateCmsContent(id, formData),
    onSuccess: () => {
      Swal.fire({
        title: "Success",
        text: "CMS content updated",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      queryClient.invalidateQueries(["cms-list"]);
      queryClient.invalidateQueries(["cms-detail", id]);
      navigate(
        pageType === ""
          ? "/cms/content"
          : pageType === "bank_detail"
            ? "/cms/bank-details"
            : pageType === "category_listing"
              ? "/cms/category-listing"
              : "/cms/content" // default fallback
      );
    },
    onError: (err) => {
      console.error(err);
      setServerError(
        err?.response?.data?.message || "Failed to update CMS content"
      );
    },
  });

  if (isEdit && isLoadingCms)
    return (
      <div className="d-flex justify-content-center p-4">
        <ButtonLoader />
      </div>
    );
  if (cmsFetchError)
    return <Alert color="danger">Failed to load CMS content</Alert>;

  const isLoading = CmsCreateMutation.isPending || CmsUpdateMutation.isPending;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button color="secondary" onClick={() => navigate(-1)}>
          Back to List
        </Button>
      </div>

      {serverError && (
        <Alert color="danger" className="mb-3">
          {serverError}
        </Alert>
      )}

      <Card>
        <CardHeader>CMS Content</CardHeader>
        <CardBody>
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              {/* Title */}
              <Col md="6" className="mb-3">
                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    type="text"
                    {...formik.getFieldProps("title")}
                    className={formik.errors.title ? "is-invalid" : ""}
                    placeholder="Enter title"
                  />
                  {formik.errors.title && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.title}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* Subtitle */}
              <Col md="6" className="mb-3">
                <FormGroup>
                  <Label>Subtitle</Label>
                  <Input
                    type="text"
                    {...formik.getFieldProps("subtitle")}
                    placeholder="Optional subtitle"
                  />
                </FormGroup>
              </Col>

              {/* Content */}
              <Col md="12" className="mb-3">
                <FormGroup>
                  <Label>Content *</Label>
                  <Input
                    type="textarea"
                    rows="4"
                    {...formik.getFieldProps("content")}
                    className={formik.errors.content ? "is-invalid" : ""}
                    placeholder="Enter content"
                  />
                  {formik.errors.content && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.content}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* Category Dropdown */}
              <Col md="6" className="mb-3">
                <FormGroup>
                  <Label>Category *</Label>
                  <AsyncSelect
                    value={selectedCategory}
                    onChange={(val) => {
                      setSelectedCategory(val);
                      formik.setFieldValue("category_id", val.value);
                    }}
                    loadOptions={loadCategoryOptions}
                    defaultOptions={true}
                    placeholder="Select category"
                    noOptionsMessage={() => "No categories found"}
                  />
                  {formik.errors.category_id && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.category_id}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* Bank Dropdown (Only if bank_detail page) */}
              {pageType === "bank_detail" && (
                <Col md="6" className="mb-3">
                  <FormGroup>
                    <Label>Bank *</Label>
                    <Input
                      type="select"
                      value={selectedBank?.value || ""}
                      onChange={(e) => {
                        const bank = banks.find(
                          (b) => b.id.toString() === e.target.value
                        );
                        setSelectedBank(bank ? { value: bank.id, label: bank.name, raw: bank } : null);
                        formik.setFieldValue("bank_id", e.target.value);
                      }}
                    >
                      <option value="">Select Bank</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                   {formik.errors.bank_id && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.bank_id}
                    </div>
                  )}
                </Col>
              )}

              {/* Image Upload */}
              <Col md="6" className="mb-3">
                <FormGroup>
                  <Label>
                    Image ({allowedExtensionsImage.join("/")}, max{" "}
                    {maxFileSize / (1024 * 1024)}MB)
                    {!isEdit && " *"}
                  </Label>
                  <Input
                    type="file"
                    name="image"
                    accept={allowedExtensionsImage.join(",")}
                    onChange={handleImage}
                    innerRef={fileRef}
                    className={cmsImgErr ? "is-invalid" : ""}
                  />
                  {formik.touched.image && formik.errors.image && (
                    <div className="invalid-feedback d-block">
                      {formik.errors.image}
                    </div>
                  )}
                  {cmsImgErr && (
                    <div className="text-danger mt-1">{cmsImgErr}</div>
                  )}
                  {showCmsImg && (
                    <img
                      src={showCmsImg}
                      alt="Preview"
                      style={{
                        height: "80px",
                        width: "80px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        marginTop: "10px",
                      }}
                    />
                  )}
                </FormGroup>
              </Col>
            </Row>

            <div className="mt-4 pt-3 border-top">
              <Button color="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <ButtonLoader />
                ) : isEdit ? (
                  "Update Content"
                ) : (
                  "Create Content"
                )}
              </Button>
              <Button
                color="secondary"
                type="button"
                onClick={() => navigate(-1)}
                className="ms-2"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default CmsForm;
