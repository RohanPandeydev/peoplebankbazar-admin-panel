import React, { useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { BiEdit } from "react-icons/bi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Wrapper from "../layouts/Wrapper";
import CmsServices from "../services/CmsServices";
import { useCustomQuery } from "../utils/QueryHooks";
import config from "../../config";
import { buildQueryString } from "../utils/BuildQuery";

const HomeCms = () => {
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState("hero_banner");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [serverError, setServerError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    button_text: "",
    button_url: "",
    button_text_secondary: "",
    button_url_secondary: "",
    image_url: "",
    slider_images: [],
    sort_order: 0,
    is_active: true,
  });
  const [files, setFiles] = useState({ image: null, slider_images: [] });
  const [formErrors, setFormErrors] = useState({});

  const homeSections = [
    {
      key: "hero_banner",
      name: "Hero Banner Section",
      description: "Main hero section with background image and content",
      content_type: "slider",
      fields: ["slider_images"],
      validationRules: { slider_images: { required: false, type: "image" } },
    },
    // Add more sections here if needed
  ];

  const {
    data: homeContent,
    isLoading: isContentLoading,
    refetch: refetchContent,
  } = useCustomQuery({
    queryKey: ["home-cms-content"],
    service: CmsServices.getAllCmsContentAdmin,
    params: buildQueryString([{ key: "page_type", value: "homepage" }]),
    staleTime: 0,
    select: (data) => data.content || [],
    errorMsg: "",
  });

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      try {
        new URL(`https://${string}`);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const currentSection = homeSections.find((s) => s.key === activeSection);
    if (!currentSection) return false;

    Object.keys(currentSection.validationRules).forEach((fieldName) => {
      const rule = currentSection.validationRules[fieldName];
      const value = formData[fieldName];

      if (rule.required && (!value || value.length === 0)) {
        errors[fieldName] = `${fieldName.replace("_", " ")} is required`;
      }

      if (rule.type === "url" && value && !isValidUrl(value)) {
        errors[fieldName] = "Please enter a valid URL";
      }

      if (rule.type === "image") {
        if (fieldName === "image_url" && !formData.image_url && !files.image) {
          if (rule.required) errors[fieldName] = "Image is required";
        }
        if (
          fieldName === "slider_images" &&
          !formData.slider_images.length &&
          !files.slider_images.length
        ) {
          if (rule.required) errors[fieldName] = "Background image is required";
        }
      }
    });

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (files.image && files.image.size > 5 * 1024 * 1024)
      errors.image = "Image size should be less than 5MB";
    if (files.image && !allowedTypes.includes(files.image.type))
      errors.image = "Only JPEG, PNG, GIF, WebP images are allowed";

    files.slider_images.forEach((file, idx) => {
      if (file.size > 5 * 1024 * 1024)
        errors.slider_images = `Image ${idx + 1} size should be less than 5MB`;
      if (!allowedTypes.includes(file.type))
        errors.slider_images = `Image ${idx + 1} type not allowed`;
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createUpdateMutation = useMutation({
    mutationFn: (data) => {
      const formDataObj = new FormData();
      Object.keys(data.textData).forEach((key) => {
        if (
          data.textData[key] !== null &&
          data.textData[key] !== undefined &&
          data.textData[key] !== ""
        )
          formDataObj.append(key, data.textData[key]);
      });

      if (data.files.image) formDataObj.append("image", data.files.image);
      if (data.files.slider_images.length > 0)
        data.files.slider_images.forEach((file) =>
          formDataObj.append("slider_images", file)
        );

      return editingContent
        ? CmsServices.updateCmsContent(editingContent.id, formDataObj)
        : CmsServices.createCmsContent(formDataObj);
    },
    onSuccess: () => {
      Swal.fire({
        title: "Success!",
        text: editingContent
          ? "Content updated successfully"
          : "Content created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      resetForm();
      setIsModalOpen(false);
      refetchContent();
      queryClient.invalidateQueries(["home-cms-content"]);
    },
    onError: (error) => {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save content"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CmsServices.deleteCmsContent({ id }),
    onSuccess: () => {
      Swal.fire({
        title: "Deleted!",
        text: "Content deleted successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      refetchContent();
      queryClient.invalidateQueries(["home-cms-content"]);
    },
    onError: (error) =>
      setServerError(
        error?.response?.data?.message || "Failed to delete content"
      ),
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (!selectedFiles) return;

    if (name === "slider_images") {
      setFiles((prev) => ({ ...prev, [name]: Array.from(selectedFiles) }));
      setFormData((prev) => ({
        ...prev,
        slider_images: Array.from(selectedFiles).map((f) =>
          URL.createObjectURL(f)
        ),
      }));
    } else {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
      setFormData((prev) => ({
        ...prev,
        image_url: URL.createObjectURL(selectedFiles[0]),
      }));
    }

    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;

    const currentSection = homeSections.find((s) => s.key === activeSection);
    const submitData = {
      textData: {
        page_type: "homepage",
        section_name: activeSection,
        content_type: currentSection.content_type,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active,
      },
      files,
    };

    currentSection.fields.forEach((field) => {
      if (formData[field] !== undefined && formData[field] !== "")
        submitData.textData[field] = formData[field];
    });

    createUpdateMutation.mutate(submitData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      button_text: "",
      button_url: "",
      button_text_secondary: "",
      button_url_secondary: "",
      image_url: "",
      slider_images: [],
      sort_order: 0,
      is_active: true,
    });
    setFiles({ image: null, slider_images: [] });
    setFormErrors({});
    setServerError("");
    setEditingContent(null);
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title || "",
      subtitle: content.subtitle || "",
      content: content.content || "",
      button_text: content.button_text || "",
      button_url: content.button_url || "",
      button_text_secondary: content.button_text_secondary || "",
      button_url_secondary: content.button_url_secondary || "",
      image_url: content.image_url || "",
      slider_images: content.slider_images
        ? content.slider_images.map(
            (img) => `${config.apiUrl}/${img.image_url}`
          )
        : [],
      sort_order: content.sort_order || 0,
      is_active: content.is_active ?? true,
    });
    setActiveSection(content.section_name);
    setIsModalOpen(true);
  };

  const handleDelete = (content) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(content.id);
    });
  };

  const openAddModal = (sectionKey) => {
    resetForm();
    setActiveSection(sectionKey);
    setIsModalOpen(true);
  };

  const getSectionContent = (sectionKey) =>
    homeContent?.filter((c) => c.section_name === sectionKey) || [];

  const renderFormFields = () => {
    const currentSection = homeSections.find((s) => s.key === activeSection);
    if (!currentSection) return null;

    return (
      <Row>
        {currentSection.fields.map((field) => {
          if (field === "slider_images") {
            return (
              <Col md="12" key={field}>
                <FormGroup>
                  <Label for="slider_images">
                    Background Images{" "}
                    {currentSection.validationRules?.slider_images
                      ?.required && <span className="text-danger">*</span>}
                  </Label>
                  <Input
                    type="file"
                    name="slider_images"
                    id="slider_images"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    invalid={!!formErrors.slider_images}
                  />
                  <small className="text-muted">
                    Supported: JPG, PNG, GIF, WebP (Max: 5MB each)
                  </small>
                  {formErrors.slider_images && (
                    <div className="invalid-feedback">
                      {formErrors.slider_images}
                    </div>
                  )}
                  {formData.slider_images.length > 0 && (
                    <div className="d-flex flex-wrap mt-2 gap-2">
                      {formData.slider_images.map((url, idx) => (
                        <img
                          key={idx}
                          src={
                            url.startsWith("http")
                              ? url
                              : `${config.apiUrl}/${url}`
                          }
                          alt={`Slider ${idx + 1}`}
                          style={{
                            width: "120px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </FormGroup>
              </Col>
            );
          } else if (field === "image_url") {
            return (
              <Col md="12" key={field}>
                <FormGroup>
                  <Label for="image_url">Background Image</Label>
                  <Input
                    type="file"
                    name="image"
                    id="image_url"
                    accept="image/*"
                    onChange={handleFileChange}
                    invalid={!!formErrors.image}
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={
                          formData.image_url.startsWith("http")
                            ? formData.image_url
                            : `${config.apiUrl}/${formData.image_url}`
                        }
                        alt="Background"
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </div>
                  )}
                </FormGroup>
              </Col>
            );
          } else {
            return (
              <Col md="12" key={field}>
                <FormGroup>
                  <Label for={field}>
                    {field
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    {currentSection.validationRules[field]?.required && (
                      <span className="text-danger">*</span>
                    )}
                  </Label>
                  <Input
                    type={
                      field.includes("url")
                        ? "url"
                        : field.includes("content")
                        ? "textarea"
                        : "text"
                    }
                    name={field}
                    id={field}
                    value={formData[field] || ""}
                    onChange={handleInputChange}
                    invalid={!!formErrors[field]}
                  />
                  {formErrors[field] && (
                    <div className="invalid-feedback">{formErrors[field]}</div>
                  )}
                </FormGroup>
              </Col>
            );
          }
        })}
      </Row>
    );
  };

  if (isContentLoading) {
    return (
      <Wrapper>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <Spinner size="lg" color="primary" />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="blog-header mb-4">
        <h1>Home CMS Management</h1>
        <p className="text-muted">Manage your homepage content sections</p>
      </div>

      {serverError && (
        <Alert color="danger" className="mb-4">
          {serverError}
          <Button close onClick={() => setServerError("")} />
        </Alert>
      )}

      <Row>
        {homeSections.map((section) => {
          const sectionContent = getSectionContent(section.key);
          return (
            <Col md="6" key={section.key} className="mb-4">
              <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <span>{section.name}</span>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => openAddModal(section.key)}
                  >
                    <IoMdAdd /> Add
                  </Button>
                </CardHeader>
                <CardBody>
                  {sectionContent.length === 0 && (
                    <p className="text-muted">No content added yet</p>
                  )}
                  {sectionContent.map((content) => (
                    <Card className="mb-2" key={content.id}>
                      <CardBody>
                        <Row>
                          <Col md="8">
                            <strong>{content.title || "No Title"}</strong>
                            {content.subtitle && <p>{content.subtitle}</p>}
                          </Col>
                          <Col md="4" className="text-end">
                            <Button
                              color="info"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(content)}
                            >
                              <BiEdit />
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(content)}
                            >
                              <IoMdTrash />
                            </Button>
                          </Col>
                        </Row>
                        {content.slider_images &&
                          content.slider_images.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {content.slider_images.map((img) => (
                                <img
                                  key={img.id}
                                  src={`${config.apiUrl}/${img.image_url}`}
                                  alt={img.image_alt || "Slider"}
                                  style={{
                                    width: "80px",
                                    height: "50px",
                                    objectFit: "cover",
                                    borderRadius: "3px",
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </CardBody>
                    </Card>
                  ))}
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(!isModalOpen)}
        size="lg"
      >
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          {editingContent ? "Edit Content" : "Add Content"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleSubmit}>{renderFormFields()}</Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            {createUpdateMutation.isLoading ? <Spinner size="sm" /> : "Save"}
          </Button>
        </ModalFooter>
      </Modal>
    </Wrapper>
  );
};

export default HomeCms;
