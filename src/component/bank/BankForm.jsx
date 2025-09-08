import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Row, Alert } from 'reactstrap'
import { useFormik } from 'formik'
import Swal from 'sweetalert2'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BankServices from '../../services/BankServices'
import slugify from "slugify"
import ButtonLoader from '../../utils/Loader/ButtonLoader'
import { useNavigate, useParams } from 'react-router-dom'
import { BankFormValidation } from "../../helper/ValidationHelper/Validation"

const BankForm = ({ title }) => {
  const { slug } = useParams()
  const [decodeSlug, setDecodeSlug] = useState(null)
  const [serverError, setServerError] = useState("")

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png", ".webp"]
  const maxFileSize = 2 * 1024 * 1024 // 2MB

  const [bankLogo, setBankLogo] = useState(null)
  const [showBankLogo, setShowBankLogo] = useState(null)
  const [bankLogoErr, setBankLogoErr] = useState("")

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const fileBankLogoRef = useRef(null)

  const isEdit = Boolean(slug && decodeSlug)

  const initialValues = {
    name: "",
    slug: "",
    description: "",
    logo: "",
    official_website: "",
    contact_number: "",
    email: "",
    address: "",
    interest_rate_min: "",
    interest_rate_max: "",
    processing_fee: "",
    min_loan_amount: "",
    max_loan_amount: "",
    tenure_min: "",
    tenure_max: "",
    eligibility_criteria: "",
    documents_required: "",
    is_featured: false,
    is_hot_offer: false,
    is_active: true,
    sort_order: 0
  }

  const formik = useFormik({
    initialValues,
    validationSchema: BankFormValidation,
    onSubmit: (values) => {
      setServerError("")
      submitHandler(values)
    }
  })

  // Fetch bank data for editing
  const { data: bankData, isLoading: isBankLoading, error: bankFetchError } = useQuery({
    queryKey: ['bank-detail', decodeSlug],
    queryFn: () => BankServices.getBankById(decodeSlug),
    enabled: !!decodeSlug && isEdit,
    retry: 1,
    onError: (err) => {
      console.error('Failed to fetch bank:', err)
      Swal.fire("Error", "Failed to load bank data", "error")
      navigate("/master/banks")
    }
  })

  // Populate form with existing data for editing
  useEffect(() => {
    if (bankData && isEdit) {
      const bank = bankData.data || bankData
      formik.setValues({
        ...initialValues,
        ...bank,
        logo: ""
      })

      if (bank.logo) {
        setShowBankLogo(bank.logo.startsWith('http') ? bank.logo : `${bank.logo}`)
      }
    }
  }, [bankData, isEdit])

  // File upload handler
  const handleBankLogo = (e) => {
    const file = e?.target?.files?.[0]
    setBankLogoErr("")
    setBankLogo(null)
    setShowBankLogo(null)

    if (!file) {
      formik.setFieldValue("logo", "")
      return
    }

    const ext = file.name.split(".").pop().toLowerCase()
    if (!allowedExtensionsImage.includes("." + ext)) {
      const errorMsg = `Invalid file type. Only ${allowedExtensionsImage.join(', ')} are allowed`
      setBankLogoErr(errorMsg)
      formik.setFieldError("logo", errorMsg)
      return
    }

    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
      setBankLogoErr(errorMsg)
      formik.setFieldError("logo", errorMsg)
      return
    }

    setBankLogo(file)
    setShowBankLogo(URL.createObjectURL(file))
    formik.setFieldValue("logo", file)
    formik.setFieldError("logo", "")
  }

  const handleCustomFormik = (e) => {
    const value = e?.target?.value || ""
    const generatedSlug = slugify(value, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
    formik.setFieldValue("slug", generatedSlug)
    formik.handleChange(e)
  }

  const submitHandler = (data) => {
    try {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (key !== 'logo' && data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, typeof data[key] === 'boolean' ? data[key] : data[key].toString().trim())
        }
      })
      if (bankLogo) formData.append("logo", bankLogo)
      if (isEdit && decodeSlug) {
        formData.append("bankId", decodeSlug)
        updateMutation.mutate(formData)
      } else {
        createMutation.mutate(formData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setServerError("Failed to prepare form data. Please try again.")
    }
  }

  const resetFormState = () => {
    formik.resetForm()
    setBankLogo(null)
    setBankLogoErr("")
    setShowBankLogo(null)
    setServerError("")
    if (fileBankLogoRef.current) fileBankLogoRef.current.value = ""
  }

  const createMutation = useMutation({
    mutationFn: (formData) => BankServices.createBank(formData),
    onSuccess: () => {
      Swal.fire({ title: "Success!", text: "Bank created successfully", icon: "success", timer: 2000, showConfirmButton: false })
      resetFormState()
      queryClient.invalidateQueries(['bank-list'])
      navigate("/master/banks")
    },
    onError: (error) => {
      console.error('Create bank error:', error)
      setServerError(error?.response?.data || error?.message || "Failed to create bank")
    }
  })

  const updateMutation = useMutation({
    mutationFn: (formData) => BankServices.updateBank(decodeSlug, formData),
    onSuccess: () => {
      Swal.fire({ title: "Success!", text: "Bank updated successfully", icon: "success", timer: 2000, showConfirmButton: false })
      queryClient.invalidateQueries(['bank-list'])
      queryClient.invalidateQueries(['bank-detail', decodeSlug])
      navigate("/master/banks")
    },
    onError: (error) => {
      console.error('Update bank error:', error)
      setServerError(error?.response?.data || error?.message || "Failed to update bank")
    }
  })

  useEffect(() => {
    if (slug) {
      try { setDecodeSlug(atob(slug)) } 
      catch { navigate("/master/banks") }
    }
  }, [slug])

  if (isEdit && isBankLoading) return <div className="d-flex justify-content-center p-4"><ButtonLoader /></div>
  if (bankFetchError) return <Alert color="danger">Failed to load bank data</Alert>

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button color="secondary" onClick={() => navigate("/master/banks")}>Back to List</Button>
      </div>

      {serverError && <Alert color="danger">{serverError}</Alert>}

      <Form onSubmit={formik.handleSubmit}>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Name *</Label>
              <Input type="text" {...formik.getFieldProps("name")} onChange={handleCustomFormik} placeholder="Bank name" className={formik.touched.name && formik.errors.name ? "is-invalid" : ""}/>
              {formik.touched.name && formik.errors.name && <div className="invalid-feedback">{formik.errors.name}</div>}
            </FormGroup>
          </Col>

          <Col md="6">
            <FormGroup>
              <Label>Slug *</Label>
              <Input type="text" {...formik.getFieldProps("slug")} placeholder="auto-generated-slug" readOnly={isEdit} className={formik.touched.slug && formik.errors.slug ? "is-invalid" : ""}/>
              {formik.touched.slug && formik.errors.slug && <div className="invalid-feedback">{formik.errors.slug}</div>}
            </FormGroup>
          </Col>

          <Col md="12">
            <FormGroup>
              <Label>Official Website</Label>
              <Input type="text" {...formik.getFieldProps("official_website")} placeholder="https://example.com"/>
            </FormGroup>
          </Col>

          <Col md="12">
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" {...formik.getFieldProps("email")} placeholder="contact@example.com"/>
            </FormGroup>
          </Col>

          <Col md="12">
            <FormGroup>
              <Label>Contact Number</Label>
              <Input type="text" {...formik.getFieldProps("contact_number")} placeholder="+91-XXXXXXXXXX"/>
            </FormGroup>
          </Col>

          {/* Status Checkboxes */}
          <Col md="12" className="mb-3">
            <FormGroup>
              <Label>Status Options</Label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <Input type="checkbox" id="is_active" {...formik.getFieldProps("is_active")} checked={formik.values.is_active} className="form-check-input"/>
                  <Label check for="is_active">Active</Label>
                </div>
                <div className="form-check">
                  <Input type="checkbox" id="is_featured" {...formik.getFieldProps("is_featured")} checked={formik.values.is_featured} className="form-check-input"/>
                  <Label check for="is_featured">Featured</Label>
                </div>
                <div className="form-check">
                  <Input type="checkbox" id="is_hot_offer" {...formik.getFieldProps("is_hot_offer")} checked={formik.values.is_hot_offer} className="form-check-input"/>
                  <Label check for="is_hot_offer">Hot Offer</Label>
                </div>
              </div>
            </FormGroup>
          </Col>

          {/* Logo Upload */}
          <Col md="6" className="mb-3">
            <FormGroup>
              <Label>Bank Logo ({allowedExtensionsImage.join('/')} max {maxFileSize / (1024*1024)}MB)</Label>
              <Input type="file" name="logo" accept={allowedExtensionsImage.join(',')} onChange={handleBankLogo} innerRef={fileBankLogoRef} className={(formik.touched.logo && formik.errors.logo) || bankLogoErr ? "is-invalid" : ""}/>
              {formik.touched.logo && formik.errors.logo && <div className="invalid-feedback">{formik.errors.logo}</div>}
              {bankLogoErr && <div className="text-danger mt-1">{bankLogoErr}</div>}
              {showBankLogo && <div className="upload-preview mt-2"><img src={showBankLogo} alt="Bank Logo" style={{height:"100px", width:"100px", objectFit:"cover", borderRadius:"8px"}}/></div>}
            </FormGroup>
          </Col>

          <Col md="12" className="mt-3">
            <Button type="submit" color="primary" disabled={isLoading || !formik.isValid}>
              {isLoading ? <><ButtonLoader /> {isEdit ? 'Updating...' : 'Creating...'}</> : (isEdit ? 'Update Bank' : 'Create Bank')}
            </Button>
            <Button color="secondary" type="button" onClick={() => navigate("/master/banks")} className="ms-2">Cancel</Button>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default BankForm
