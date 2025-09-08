import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Row, Alert, Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import { useFormik } from 'formik'
import Swal from 'sweetalert2'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import PromotionalServices from '../../services/PromotionalServices'
import CategoryServices from '../../services/CategoryServices'
import BankServices from '../../services/BankServices'
import ButtonLoader from '../../utils/Loader/ButtonLoader'
import { useNavigate, useParams } from 'react-router-dom'
import { PromotionalFormValidation } from '../../helper/ValidationHelper/Validation'
import AsyncSelect from 'react-select/async'
import classnames from 'classnames'
import { buildQueryString } from '../../utils/BuildQuery'

const PromotionalForm = ({ title }) => {
  const { id } = useParams()
  const [serverError, setServerError] = useState("")
  const [promoImg, setPromoImg] = useState(null)
  const [showPromoImg, setShowPromoImg] = useState(null)
  const [promoImgErr, setPromoImgErr] = useState("")
  const [activeTab, setActiveTab] = useState('1')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBanks, setSelectedBanks] = useState([])
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const filePromoImgRef = useRef(null)
  const isEdit = Boolean(id)

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png", ".webp"]
  const maxFileSize = 2 * 1024 * 1024 // 2MB

  const initialValues = {
    title: "",
    sub_text: "",
    main_text: "",
    card_type: "other",
    background_color: "#4285f4",
    text_color: "#000000",
    button_text: "",
    button_url: "",
    target_audience: "all",
    is_featured: false,
    is_hot_offer: false,
    is_active: true,
    sort_order: 0,
    start_date: "",
    end_date: "",
    category_ids: [],
    bank_ids: [],
    image: ""
  }

  const formik = useFormik({
    initialValues,
    validationSchema: PromotionalFormValidation,
    onSubmit: (values) => {
      setServerError("")
      submitHandler(values)
    }
  })

  // Fetch promo card for editing
  const { data: promoData, isLoading: isLoadingPromo, error: promoFetchError } = useQuery({
    queryKey: ['promo-detail', id],
    queryFn: () => PromotionalServices.getPromotionalCardById(id),
    enabled: isEdit
  })

  // Load categories with search
  const loadCategoryOptions = async (inputValue) => {
    try {
      const params = buildQueryString([
        { key: "page", value: 1 },
        { key: "limit", value: 50 },
        { key: "search", value: inputValue },
        { key: "is_active", value: true },
      ])
      
      const response = await CategoryServices.categoryList(params)
      const categories = response?.categories || []
      
      return categories.map(category => ({
        value: category.id,
        label: category.name,
        ...category
      }))
    } catch (error) {
      console.error('Error loading categories:', error)
      return []
    }
  }

  // Load banks with search
  const loadBankOptions = async (inputValue) => {
    try {
      const params = buildQueryString([
        { key: "page", value: 1 },
        { key: "limit", value: 50 },
        { key: "search", value: inputValue },
        { key: "is_active", value: true },
      ])
      
      const response = await BankServices.getAllBanksAdmin(params)

      const banks = response?.banks || []
      
      return banks.map(bank => ({
        value: bank.id,
        label: bank.name,
        ...bank
      }))
    } catch (error) {
      console.error('Error loading banks:', error)
      return []
    }
  }

  // Load default options on mount
  const loadDefaultCategoryOptions = async() => await loadCategoryOptions('')
  const loadDefaultBankOptions = async() => await loadBankOptions('')

  useEffect(() => {
    if (promoData && isEdit) {
      const promo = promoData.data || promoData
      
      formik.setValues({
        title: promo.title || "",
        sub_text: promo.sub_text || "",
        main_text: promo.main_text || "",
        card_type: promo.card_type || "other",
        background_color: promo.background_color || "#4285f4",
        text_color: promo.text_color || "#000000",
        button_text: promo.button_text || "",
        button_url: promo.button_url || "",
        target_audience: promo.target_audience || "all",
        is_featured: promo.is_featured || false,
        is_hot_offer: promo.is_hot_offer || false,
        is_active: promo.is_active !== undefined ? promo.is_active : true,
        sort_order: promo.sort_order || 0,
        start_date: promo.start_date ? promo.start_date.split("T")[0] : "",
        end_date: promo.end_date ? promo.end_date.split("T")[0] : "",
        category_ids: [],
        bank_ids: [],
        image: ""
      })

      // Set selected categories
      if (promo.categories && Array.isArray(promo.categories)) {
        const categoryOptions = promo.categories.map(cat => ({
          value: cat.id,
          label: cat.name,
          ...cat
        }))
        setSelectedCategories(categoryOptions)
      }

      // Set selected banks
      if (promo.banks && Array.isArray(promo.banks)) {
        const bankOptions = promo.banks.map(bank => ({
          value: bank.id,
          label: bank.name,
          ...bank
        }))
        setSelectedBanks(bankOptions)
      }

      if (promo.image_url) {
        setShowPromoImg(promo.image_url.startsWith('http') ? promo.image_url : `/uploads/${promo.image_url}`)
      }
    }
  }, [promoData, isEdit])

  const handlePromoImage = (e) => {
    const file = e?.target?.files?.[0]
    setPromoImgErr("")
    setPromoImg(null)
    setShowPromoImg(null)
    if (!file) {
      formik.setFieldValue("image", "")
      return
    }

    const ext = file.name.split(".").pop().toLowerCase()
    if (!allowedExtensionsImage.includes("." + ext)) {
      const errorMsg = `Invalid file type. Only ${allowedExtensionsImage.join(', ')} allowed`
      setPromoImgErr(errorMsg)
      formik.setFieldError("image", errorMsg)
      return
    }
    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${maxFileSize / (1024 * 1024)}MB`
      setPromoImgErr(errorMsg)
      formik.setFieldError("image", errorMsg)
      return
    }

    setPromoImg(file)
    setShowPromoImg(URL.createObjectURL(file))
    formik.setFieldValue("image", file)
  }

  const submitHandler = (data) => {
    try {
      const formData = new FormData()
      
      // Add form fields
      Object.keys(data).forEach(key => {
        if (key !== "image" && key !== "category_ids" && key !== "bank_ids" && data[key] !== null && data[key] !== undefined) {
          if (typeof data[key] === "boolean") {
            formData.append(key, data[key])
          } else {
            formData.append(key, data[key].toString().trim())
          }
        }
      })

      // Add category and bank IDs
      const categoryIds = [selectedCategories].map(cat => cat.value)
      const bankIds = [selectedBanks].map(bank => bank.value)
      
      if (categoryIds.length > 0) {
        formData.append("category_ids", categoryIds.join(','))
      }
      if (bankIds.length > 0) {
        formData.append("bank_ids", bankIds.join(','))
      }

      // Add image if present
      if (promoImg) {
        formData.append("image", promoImg)
      }

      if (isEdit) {
        PromotionalUpdateMutation.mutate(formData)
      } else {
        PromotionalCreateMutation.mutate(formData)
      }
    } catch (err) {
      console.error(err)
      setServerError("Failed to prepare form data")
    }
  }

  const resetFormState = () => {
    formik.resetForm()
    setPromoImg(null)
    setPromoImgErr("")
    setShowPromoImg(null)
    setSelectedCategories([])
    setSelectedBanks([])
    setServerError("")
    if (filePromoImgRef.current) filePromoImgRef.current.value = ""
  }

  const PromotionalCreateMutation = useMutation({
    mutationFn: (formData) => PromotionalServices.createPromotionalCard(formData),
    onSuccess: () => {
      Swal.fire({ title: "Success", text: "Promotional card created", icon: "success", timer: 2000, showConfirmButton: false })
      resetFormState()
      queryClient.invalidateQueries(['promo-list'])
      navigate("/promotions/cards")
    },
    onError: (err) => {
      console.error(err?.response?.data)
      setServerError(err?.response?.data || "Failed to create promotional card")
    }
  })

  const PromotionalUpdateMutation = useMutation({
    mutationFn: (formData) => PromotionalServices.updatePromotionalCard(id, formData),
    onSuccess: () => {
      Swal.fire({ title: "Success", text: "Promotional card updated", icon: "success", timer: 2000, showConfirmButton: false })
      queryClient.invalidateQueries(['promo-list'])
      queryClient.invalidateQueries(['promo-detail', id])
      navigate("/promotions/cards")
    },
    onError: (err) => {
      console.error(err)
      setServerError(err?.response?.data?.message || "Failed to update promotional card")
    }
  })

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions || [])
  }

  const handleBankChange = (selectedOptions) => {
    setSelectedBanks(selectedOptions || [])
  }

  if (isEdit && isLoadingPromo) return <div className="d-flex justify-content-center p-4"><ButtonLoader /></div>
  if (promoFetchError) return <Alert color="danger">Failed to load promotional card data</Alert>

  const isLoading = PromotionalCreateMutation.isPending || PromotionalUpdateMutation.isPending

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button color="secondary" onClick={() => navigate("/promotions/cards")}>
          Back to List
        </Button>
      </div>

      {serverError && <Alert color="danger" className="mb-3">{serverError}</Alert>}

      <Card>
        <CardHeader>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => toggle('1')}
                style={{ cursor: 'pointer' }}
              >
                Basic Info
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => toggle('2')}
                style={{ cursor: 'pointer' }}
              >
                Design & Style
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => toggle('3')}
                style={{ cursor: 'pointer' }}
              >
                Button & Actions
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '4' })}
                onClick={() => toggle('4')}
                style={{ cursor: 'pointer' }}
              >
                Categories & Banks
              </NavLink>
            </NavItem>
            {/* <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '5' })}
                onClick={() => toggle('5')}
                style={{ cursor: 'pointer' }}
              >
                Settings
              </NavLink>
            </NavItem> */}
          </Nav>
        </CardHeader>
        
        <CardBody>
          <Form onSubmit={formik.handleSubmit}>
            <TabContent activeTab={activeTab}>
              {/* Basic Info Tab */}
              <TabPane tabId="1">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Title *</Label>
                      <Input 
                        type="text" 
                        {...formik.getFieldProps("title")} 
                        className={formik.errors.title ? "is-invalid" : ""} 
                        placeholder="Enter promotional card title"
                      />
                      {formik.errors.title && <div className="invalid-feedback d-block">{formik.errors.title}</div>}
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Sub Text</Label>
                      <Input 
                        type="text" 
                        {...formik.getFieldProps("sub_text")} 
                        placeholder="Optional sub text"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="12" className="mb-3">
                    <FormGroup>
                      <Label>Main Text *</Label>
                      <Input 
                        type="textarea" 
                        rows="3" 
                        {...formik.getFieldProps("main_text")} 
                        className={formik.errors.main_text ? "is-invalid" : ""} 
                        placeholder="Enter main promotional text"
                      />
                      {formik.errors.main_text && <div className="invalid-feedback d-block">{formik.errors.main_text}</div>}
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Card Type *</Label>
                      <Input type="select" {...formik.getFieldProps("card_type")}>
                        <option value="investment">Investment</option>
                        <option value="insurance">Insurance</option>
                        <option value="calculator">Calculator</option>
                        <option value="loan">Loan</option>
                        <option value="other">Other</option>
                      </Input>
                    </FormGroup>
                  </Col>

                  {/* <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Target Audience</Label>
                      <Input type="select" {...formik.getFieldProps("target_audience")}>
                        <option value="all">All Users</option>
                        <option value="new_users">New Users</option>
                        <option value="existing_users">Existing Users</option>
                        <option value="premium_users">Premium Users</option>
                      </Input>
                    </FormGroup>
                  </Col> */}

                  <Col md="12" className="mb-3">
                    <FormGroup>
                      <Label> Image ({allowedExtensionsImage.join('/')}, max {maxFileSize / (1024 * 1024)}MB)
                {!isEdit && " *"}</Label>
                      <Input 
                        type="file" 
                        name="image" 
                        accept={allowedExtensionsImage.join(',')} 
                        onChange={handlePromoImage} 
                        innerRef={filePromoImgRef} 
                        className={promoImgErr ? "is-invalid" : ""} 
                      />
                         {formik.touched.image && formik.errors.image && (
                <div className="invalid-feedback d-block">{formik.errors.image}</div>
              )}
                      {promoImgErr && <div className="text-danger mt-1">{promoImgErr}</div>}
                      {showPromoImg && (
                        <img 
                          src={showPromoImg} 
                          alt="Preview" 
                          style={{ 
                            height: "100px", 
                            width: "100px", 
                            objectFit: "cover", 
                            borderRadius: "8px", 
                            border: "2px solid #ddd", 
                            marginTop: "10px" 
                          }} 
                        />
                      )}
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Design & Style Tab */}
              <TabPane tabId="2">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Background Color</Label>
                      <Input 
                        type="color" 
                        {...formik.getFieldProps("background_color")} 
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Text Color</Label>
                      <Input 
                        type="color" 
                        {...formik.getFieldProps("text_color")} 
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Button & Actions Tab */}
              <TabPane tabId="3">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Button Text</Label>
                      <Input 
                        type="text" 
                        {...formik.getFieldProps("button_text")} 
                        placeholder="e.g., Learn More, Get Started"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Button URL</Label>
                      <Input 
                        type="url" 
                        {...formik.getFieldProps("button_url")} 
                        placeholder="https://example.com"
                        className={formik.errors.button_url ? "is-invalid" : ""}
                      />
                      {formik.errors.button_url && <div className="invalid-feedback d-block">{formik.errors.button_url}</div>}
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Categories & Banks Tab */}
              <TabPane tabId="4">
                <Row>
                  <Col md="12" className="mb-3">
                    <FormGroup>
                      <Label>Categories</Label>
                      <AsyncSelect
                        // isMulti
                        value={selectedCategories}
                        onChange={handleCategoryChange}
                        loadOptions={loadCategoryOptions}
                        defaultOptions={true}
                        loadOptionsOnMenuOpen={true}
                        placeholder="Search and select categories..."
                        noOptionsMessage={() => "No categories found"}
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '38px',
                            borderColor: '#ced4da',
                            '&:hover': {
                              borderColor: '#ced4da',
                            },
                          }),
                        }}
                      />
                      <small className="text-muted">Select multiple categories for this promotional card</small>
                    </FormGroup>
                  </Col>

                  <Col md="12" className="mb-3">
                    <FormGroup>
                      <Label>Banks</Label>
                      <AsyncSelect
                        // isMulti
                        value={selectedBanks}
                        onChange={handleBankChange}
                        loadOptions={loadBankOptions}
                        defaultOptions={true}
                        loadOptionsOnMenuOpen={true}
                        placeholder="Search and select banks..."
                        noOptionsMessage={() => "No banks found"}
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '38px',
                            borderColor: '#ced4da',
                            '&:hover': {
                              borderColor: '#ced4da',
                            },
                          }),
                        }}
                      />
                      <small className="text-muted">Select multiple banks for this promotional card</small>
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Settings Tab */}
              <TabPane tabId="5">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Sort Order</Label>
                      <Input 
                        type="number" 
                        {...formik.getFieldProps("sort_order")} 
                        placeholder="0"
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label></Label>
                      <div className="d-flex flex-wrap gap-3 mt-4">
                        <div className="form-check">
                          <Input 
                            type="checkbox" 
                            id="is_active" 
                            {...formik.getFieldProps("is_active")} 
                            checked={formik.values.is_active} 
                            className="form-check-input" 
                          />
                          <Label check htmlFor="is_active">Active</Label>
                        </div>
                        <div className="form-check">
                          <Input 
                            type="checkbox" 
                            id="is_featured" 
                            {...formik.getFieldProps("is_featured")} 
                            checked={formik.values.is_featured} 
                            className="form-check-input" 
                          />
                          <Label check htmlFor="is_featured">Featured</Label>
                        </div>
                        <div className="form-check">
                          <Input 
                            type="checkbox" 
                            id="is_hot_offer" 
                            {...formik.getFieldProps("is_hot_offer")} 
                            checked={formik.values.is_hot_offer} 
                            className="form-check-input" 
                          />
                          <Label check htmlFor="is_hot_offer">Hot Offer</Label>
                        </div>
                      </div>
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Start Date</Label>
                      <Input 
                        type="date" 
                        {...formik.getFieldProps("start_date")} 
                      />
                    </FormGroup>
                  </Col>

                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>End Date</Label>
                      <Input 
                        type="date" 
                        {...formik.getFieldProps("end_date")} 
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>

            <div className="mt-4 pt-3 border-top">
              <Button color="primary" type="submit" disabled={isLoading}>
                {isLoading ? <ButtonLoader /> : isEdit ? "Update Promotional Card" : "Create Promotional Card"}
              </Button>
              <Button 
                color="secondary" 
                type="button" 
                onClick={() => navigate("/promotions/cards")} 
                className="ms-2"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default PromotionalForm