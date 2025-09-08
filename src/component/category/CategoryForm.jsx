import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Row, Alert } from 'reactstrap'
import { useFormik } from 'formik'
import Swal from 'sweetalert2'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CategoryServices from '../../services/CategoryServices'
import slugify from "slugify"
import ButtonLoader from '../../utils/Loader/ButtonLoader'
import { useNavigate, useParams } from 'react-router-dom'
import { CategoryFormValidation } from "../../helper/ValidationHelper/Validation"

const CategoryForm = ({ title }) => {
  const { slug } = useParams()
  const [decodeSlug, setDecodeSlug] = useState(null)
  const [serverError, setServerError] = useState("")

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png", ".webp"]
  const maxFileSize = 2 * 1024 * 1024 // 2MB

  const [categoryImg, setCategoryImg] = useState(null)
  const [showCategoryImg, setShowCategoryImg] = useState(null)
  const [categoryImgErr, setCategoryImgErr] = useState("")

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const fileCategoryImgRef = useRef(null)

  const isEdit = Boolean(slug && decodeSlug)

  const initialValues = {
    name: "",
    slug: "",
    description: "",
    image: "",
    parent_id: "",
    category_type: "loan",
    is_featured: false,
    is_hot_offer: false,
    is_active: true,
    sort_order: 0,
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  }

  const formik = useFormik({
    initialValues,
    validationSchema: CategoryFormValidation,
    onSubmit: (values) => {
      setServerError("") // Clear previous server errors
      submitHandler(values)
    }
  })

  // Fetch category data for editing
  const { data: categoryData, isLoading: isCategoryLoading, error: categoryFetchError } = useQuery({
    queryKey: ['category-detail', decodeSlug],
    queryFn: () => CategoryServices.getCategoryBySlug(decodeSlug),
    enabled: !!decodeSlug && isEdit,
    retry: 1,
    onError: (err) => {
      console.error('Failed to fetch category:', err)
      Swal.fire("Error", "Failed to load category data", "error")
      navigate("/master/categories")
    }
  })

  // Populate form with existing data for editing
  useEffect(() => {
    if (categoryData && isEdit) {
      const category = categoryData.data || categoryData
      formik.setValues({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        image: "",
        parent_id: category.parent_id || "",
        category_type: category.category_type || "loan",
        is_featured: category.is_featured || false,
        is_hot_offer: category.is_hot_offer || false,
        is_active: category.is_active !== undefined ? category.is_active : true,
        sort_order: category.sort_order || 0,
        meta_title: category.meta_title || "",
        meta_description: category.meta_description || "",
        meta_keywords: category.meta_keywords || ""
      })

      if (category.image) {
        setShowCategoryImg(category.image.startsWith('http') ? category.image : `/uploads/${category.image}`)
      }
    }
  }, [categoryData, isEdit])

  // Enhanced file validation
  const handleCategoryImage = (e) => {
    const file = e?.target?.files?.[0]

    // Reset states
    setCategoryImgErr("")
    setCategoryImg(null)
    setShowCategoryImg(null)

    if (!file) {
      formik.setFieldValue("image", "")
      return
    }

    // File extension validation
    const ext = file.name.split(".").pop().toLowerCase()
    if (!allowedExtensionsImage.includes("." + ext)) {
      const errorMsg = `Invalid file type. Only ${allowedExtensionsImage.join(', ')} are allowed`
      setCategoryImgErr(errorMsg)
      formik.setFieldError("image", errorMsg)
      return
    }

    // File size validation
    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
      setCategoryImgErr(errorMsg)
      formik.setFieldError("image", errorMsg)
      return
    }

    // File type validation (MIME type)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.type)) {
      const errorMsg = "Invalid file format detected"
      setCategoryImgErr(errorMsg)
      formik.setFieldError("image", errorMsg)
      return
    }

    // Success - set the file
    setCategoryImg(file)
    setShowCategoryImg(URL.createObjectURL(file))
    formik.setFieldValue("image", file)
    formik.setFieldError("image", "") // Clear any previous errors
  }

  // Enhanced slugify with validation
  const handleCustomFormik = (e) => {
    const value = e?.target?.value || ""
    const generatedSlug = slugify(value, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    })

    formik.setFieldValue("slug", generatedSlug)
    formik.handleChange(e)
  }

  // Enhanced form submission
  const submitHandler = (data) => {
    try {
      // Create FormData
      const formData = new FormData()

      // Append all form fields (excluding image initially)
      Object.keys(data).forEach((key) => {
        if (key !== 'image' && data[key] !== null && data[key] !== undefined && data[key] !== '') {
          // Handle boolean values properly
          if (typeof data[key] === 'boolean') {
            formData.append(key, data[key])
          } else {
            formData.append(key, data[key].toString().trim())
          }
        }
      })

      // Handle image upload
      if (categoryImg) {
        formData.append("image", categoryImg)
      }

      // Debug log
      console.log('Form submission data:')
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      if (isEdit && decodeSlug) {
        formData.append("slugId", decodeSlug)
        updateMutation.mutate(formData)
      } else {
        createMutation.mutate(formData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setServerError("Failed to prepare form data. Please try again.")
    }
  }

  // Reset form helper
  const resetFormState = () => {
    formik.resetForm()
    setCategoryImg(null)
    setCategoryImgErr("")
    setShowCategoryImg(null)
    setServerError("")
    if (fileCategoryImgRef.current) {
      fileCategoryImgRef.current.value = ""
    }
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (formData) => CategoryServices.createCategory(formData),
    onSuccess: (data) => {
      Swal.fire({
        title: "Success!",
        text: "Category created successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      })
      resetFormState()
      queryClient.invalidateQueries(['category-list'])
      navigate("/master/categories")
    },
    onError: (error) => {
      console.error('Create category error:', error)
      const errorMessage = error?.response?.data ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create category"

      setServerError(errorMessage)
      Swal.fire("Error", errorMessage, "error")

      // Handle specific validation errors
      if (error?.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(field => {
          formik.setFieldError(field, error.response.data.errors[field][0])
        })
      }
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (formData) => CategoryServices.updateCategory(decodeSlug, formData),
    onSuccess: (data) => {
      Swal.fire({
        title: "Success!",
        text: "Category updated successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      })
      queryClient.invalidateQueries(['category-list'])
      queryClient.invalidateQueries(['category-detail', decodeSlug])
      navigate("/master/categories")
    },
    onError: (error) => {
      console.error('Update category error:', error)
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update category"

      setServerError(errorMessage)
      Swal.fire("Error", errorMessage, "error")

      if (error?.response?.data?.errors) {
        Object.keys(error.response.data.errors).forEach(field => {
          formik.setFieldError(field, error.response.data.errors[field][0])
        })
      }
    }
  })

  // Handle URL slug decoding
  useEffect(() => {
    if (slug) {
      try {
        const decoded = atob(slug)
        setDecodeSlug(decoded)
      } catch (error) {
        console.error('Invalid slug format:', error)
        Swal.fire("Error", "Invalid category identifier", "error")
        navigate("/master/categories")
      }
    }
  }, [slug, navigate])

  // Loading state
  if (isEdit && isCategoryLoading) {
    return <div className="d-flex justify-content-center p-4"><ButtonLoader /></div>
  }

  // Error state
  if (categoryFetchError) {
    return (
      <Alert color="danger">
        <h4>Error Loading Category</h4>
        <p>Failed to load category data. Please try again.</p>
        <Button color="primary" onClick={() => navigate("/master/categories")}>
          Back to Categories
        </Button>
      </Alert>
    )
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button color="secondary" onClick={() => navigate("/master/categories")}>
          Back to List
        </Button>
      </div>

      {serverError && (
        <Alert color="danger" className="mb-3">
          <strong>Error:</strong> {serverError}
        </Alert>
      )}

      <Form onSubmit={formik.handleSubmit}>
        <Row>
          {/* Name */}
          <Col md="6" className="mb-3">
            <FormGroup>
              <Label>Name *</Label>
              <Input
                type="text"
                {...formik.getFieldProps("name")}
                onChange={handleCustomFormik}
                className={formik.touched.name && formik.errors.name ? "is-invalid" : ""}
                placeholder="Enter category name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback d-block">{formik.errors.name}</div>
              )}
            </FormGroup>
          </Col>

          {/* Slug */}
          <Col md="6" className="mb-3">
            <FormGroup>
              <Label>Slug *</Label>
              <Input
                type="text"
                {...formik.getFieldProps("slug")}
                className={formik.touched.slug && formik.errors.slug ? "is-invalid" : ""}
                placeholder="auto-generated-slug"
                readOnly={isEdit}
              />
              {formik.touched.slug && formik.errors.slug && (
                <div className="invalid-feedback d-block">{formik.errors.slug}</div>
              )}
            </FormGroup>
          </Col>

          {/* Description */}
          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                rows="3"
                {...formik.getFieldProps("description")}
                placeholder="Enter category description (optional)"
              />
            </FormGroup>
          </Col>

          {/* Category Type */}
          <Col md="6" className="mb-3">
            <FormGroup>
              <Label>Category Type *</Label>
              <Input
                type="select"
                {...formik.getFieldProps("category_type")}
                className={formik.touched.category_type && formik.errors.category_type ? "is-invalid" : ""}
              >
                <option value="loan">Loan</option>
                <option value="insurance">Insurance</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </Input>
              {formik.touched.category_type && formik.errors.category_type && (
                <div className="invalid-feedback d-block">{formik.errors.category_type}</div>
              )}
            </FormGroup>
          </Col>

          {/* Sort Order */}
          {/* <Col md="6" className="mb-3">
            <FormGroup>
              <Label>Sort Order</Label>
              <Input
                type="number"
                {...formik.getFieldProps("sort_order")}
                min="0"
                placeholder="0"
              />
            </FormGroup>
          </Col> */}

          {/* Status Checkboxes */}
          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Status Options</Label>
              <div className="d-flex flex-wrap gap-3">
                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_active"
                    {...formik.getFieldProps("is_active")}
                    checked={formik.values.is_active}
                    className="form-check-input"
                  />
                  <Label check for="is_active">Active</Label>
                </div>
                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_featured"
                    {...formik.getFieldProps("is_featured")}
                    checked={formik.values.is_featured}
                    className="form-check-input"
                  />
                  <Label check for="is_featured">Featured</Label>
                </div>
                <div className="form-check">
                  <Input
                    type="checkbox"
                    id="is_hot_offer"
                    {...formik.getFieldProps("is_hot_offer")}
                    checked={formik.values.is_hot_offer}
                    className="form-check-input"
                  />
                  <Label check for="is_hot_offer">Hot Offer</Label>
                </div>
              </div>
            </FormGroup>
          </Col>

          {/* Image */}
          <Col md="6" className="mb-3">
            <FormGroup>
              <Label>
                Category Image ({allowedExtensionsImage.join('/')}, max {maxFileSize / (1024 * 1024)}MB)
                {!isEdit && " *"}
              </Label>
              <Input
                type="file"
                name="image"
                accept={allowedExtensionsImage.join(',')}
                onChange={handleCategoryImage}
                innerRef={fileCategoryImgRef}
                className={(formik.touched.image && formik.errors.image) || categoryImgErr ? "is-invalid" : ""}
              />
              {formik.touched.image && formik.errors.image && (
                <div className="invalid-feedback d-block">{formik.errors.image}</div>
              )}
              {categoryImgErr && (
                <div className="text-danger mt-1">{categoryImgErr}</div>
              )}
              {showCategoryImg && (
                <div className="upload-preview mt-2">
                  <img
                    src={showCategoryImg}
                    alt="Category Preview"
                    style={{
                      height: "100px",
                      width: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #ddd"
                    }}
                  />
                </div>
              )}
            </FormGroup>
          </Col>

          {/* Meta Fields */}
          {/* <Col md="12" className="mb-3">
            <h5>SEO Meta Information (Optional)</h5>
          </Col>
          
          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Meta Title</Label>
              <Input
                type="text"
                {...formik.getFieldProps("meta_title")}
                placeholder="SEO meta title"
                maxLength="60"
              />
            </FormGroup>
          </Col>

          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Meta Description</Label>
              <Input
                type="textarea"
                rows="2"
                {...formik.getFieldProps("meta_description")}
                placeholder="SEO meta description"
                maxLength="160"
              />
            </FormGroup>
          </Col>

          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Meta Keywords</Label>
              <Input
                type="text"
                {...formik.getFieldProps("meta_keywords")}
                placeholder="keyword1, keyword2, keyword3"
              />
            </FormGroup>
          </Col> */}

          {/* Submit Button */}
          <Col md="12">
            <FormGroup>
              <div className="d-flex gap-2">
                <Button
                  color="primary"
                  type="submit"
                  disabled={isLoading || !formik.isValid}
                  className="px-4 py-2"
                >
                  {isLoading ? (
                    <>
                      <ButtonLoader /> {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEdit ? 'Update Category' : 'Create Category'
                  )}
                </Button>

                <Button
                  color="secondary"
                  type="button"
                  onClick={() => navigate("/master/categories")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </FormGroup>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default CategoryForm