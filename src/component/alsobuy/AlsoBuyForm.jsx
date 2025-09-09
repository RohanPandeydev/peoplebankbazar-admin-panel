import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, FormGroup, Input, Label, Row, Alert, Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import { useFormik } from 'formik';
import Swal from 'sweetalert2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncSelect from 'react-select/async';
import classnames from 'classnames';
import { AlsoBuyFormValidation } from '../../helper/ValidationHelper/Validation';
import AlsoBuyServices from '../../services/AlsoBuyServices';
import BankServices from '../../services/BankServices';
import CategoryServices from '../../services/CategoryServices';
import ButtonLoader from '../../utils/Loader/ButtonLoader';
import { useNavigate, useParams } from 'react-router-dom';
import { buildQueryString } from '../../utils/BuildQuery';

const AlsoBuyForm = ({ title }) => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileItemImgRef = useRef(null);

  const [serverError, setServerError] = useState("");
  const [itemImg, setItemImg] = useState(null);
  const [showItemImg, setShowItemImg] = useState(null);
  const [itemImgErr, setItemImgErr] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png", ".webp"];
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const initialValues = {
    title: "",
    description: "",
    link_url: "",
    discount_percentage: "",
    discount_text: "",
    badge_text: "",
    badge_color: "#00ff00",
    is_featured: false,
    is_active: true,
    sort_order: 0,
    bank_id: null,
    category_id: null,
    image: ""
  };

  const formik = useFormik({
    initialValues,
    validationSchema: AlsoBuyFormValidation,
    onSubmit: (values) => {
      setServerError("");
      submitHandler(values);
    }
  });

  // Load item for edit
  const { data: itemData, isLoading: isLoadingItem } = useQuery({
    queryKey: ['also-buy-detail', id],
    queryFn: () => AlsoBuyServices.getAlsoBuyItemById(id),
    enabled: isEdit
  });

  useEffect(() => {
    if (itemData && isEdit) {
      const item = itemData.data || itemData;
      formik.setValues({
        ...initialValues,
        title: item.title || "",
        description: item.description || "",
        link_url: item.link_url || "",
        discount_percentage: item.discount_percentage || "",
        discount_text: item.discount_text || "",
        badge_text: item.badge_text || "",
        badge_color: item.badge_color || "green",
        is_featured: item.is_featured || false,
        is_active: item.is_active !== undefined ? item.is_active : true,
        sort_order: item.sort_order || 0,
        bank_id: item.bank_id || null,
        category_id: item.category_id || null,
        image: ""
      });

      if (item.bank) setSelectedBank({ value: item.bank.id, label: item.bank.name });
      if (item.category) setSelectedCategory({ value: item.category.id, label: item.category.name });
      if (item.image) setShowItemImg(item.image.startsWith('http') ? item.image : `/uploads/${item.image}`);
    }
  }, [itemData, isEdit]);

  const handleItemImage = (e) => {
    const file = e?.target?.files?.[0];
    setItemImgErr("");
    setItemImg(null);
    setShowItemImg(null);

    if (!file) {
      formik.setFieldValue("image", "");
      return;
    }

    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensionsImage.includes("." + ext)) {
      const errorMsg = `Invalid file type. Only ${allowedExtensionsImage.join(', ')} allowed`;
      setItemImgErr(errorMsg);
      formik.setFieldError("image", errorMsg);
      return;
    }

    if (file.size > maxFileSize) {
      const errorMsg = `File size must be less than ${maxFileSize / (1024 * 1024)}MB`;
      setItemImgErr(errorMsg);
      formik.setFieldError("image", errorMsg);
      return;
    }

    setItemImg(file);
    setShowItemImg(URL.createObjectURL(file));
    formik.setFieldValue("image", file);
  };

  const loadBankOptions = async (inputValue) => {
    const params = buildQueryString([{ key: "search", value: inputValue }, { key: "is_active", value: true }]);
    const response = await BankServices.getAllBanksAdmin(params);
    return (response.banks || []).map(bank => ({ value: bank.id, label: bank.name }));
  };

  const loadCategoryOptions = async (inputValue) => {
    const params = buildQueryString([{ key: "search", value: inputValue }, { key: "is_active", value: true }]);
    const response = await CategoryServices.categoryList(params);
    return (response.categories || []).map(cat => ({ value: cat.id, label: cat.name }));
  };

  const submitHandler = (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== "image" && data[key] !== null && data[key] !== undefined) {
          formData.append(key, typeof data[key] === "boolean" ? data[key] : data[key].toString().trim());
        }
      });

      // console.log(selectedBank,selectedCategory)

      // if (selectedBank) formData.append("bank_id", parseInt(selectedBank.value));
      // if (selectedCategory) formData.append("category_id", parseInt(selectedCategory.value));
      if (itemImg) formData.append("image", itemImg);

      if (isEdit) AlsoBuyUpdateMutation.mutate(formData);
      else AlsoBuyCreateMutation.mutate(formData);
    } catch (err) {
      console.error(err);
      setServerError("Failed to prepare form data");
    }
  };

  console.log(formik.errors)

  const resetFormState = () => {
    formik.resetForm();
    setItemImg(null);
    setItemImgErr("");
    setShowItemImg(null);
    setSelectedBank(null);
    setSelectedCategory(null);
    setServerError("");
    if (fileItemImgRef.current) fileItemImgRef.current.value = "";
  };

  const AlsoBuyCreateMutation = useMutation({
    mutationFn: (formData) => AlsoBuyServices.createAlsoBuyItem(formData),
    onSuccess: () => {
      Swal.fire({ title: "Success", text: "Also Buy item created", icon: "success", timer: 2000, showConfirmButton: false });
      resetFormState();
      queryClient.invalidateQueries(['also-buy-list']);
      navigate("/promotions/also-buy");
    },
    onError: (err) => {
      console.error(err);
      setServerError(err?.response?.data?.message || "Failed to create item");
    }
  });

  const AlsoBuyUpdateMutation = useMutation({
    mutationFn: (formData) => AlsoBuyServices.updateAlsoBuyItem(id, formData),
    onSuccess: () => {
      Swal.fire({ title: "Success", text: "Also Buy item updated", icon: "success", timer: 2000, showConfirmButton: false });
      queryClient.invalidateQueries(['also-buy-list']);
      queryClient.invalidateQueries(['also-buy-detail', id]);
      navigate("/promotions/also-buy");
    },
    onError: (err) => {
      console.error(err);
      setServerError(err?.response?.data?.message || "Failed to update item");
    }
  });

  const toggle = tab => { if (activeTab !== tab) setActiveTab(tab); };
  if (isEdit && isLoadingItem) return <div className="d-flex justify-content-center p-4"><ButtonLoader /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{title}</h1>
        <Button color="secondary" onClick={() => navigate("/promotions/also-buy")}>Back to List</Button>
      </div>

      {serverError && <Alert color="danger" className="mb-3">{serverError}</Alert>}

      <Card>
        <CardHeader>
          <Nav tabs>
            <NavItem><NavLink className={classnames({ active: activeTab === '1' })} onClick={() => toggle('1')} style={{ cursor: 'pointer' }}>Basic Info</NavLink></NavItem>
            <NavItem><NavLink className={classnames({ active: activeTab === '2' })} onClick={() => toggle('2')} style={{ cursor: 'pointer' }}>Links & Discounts</NavLink></NavItem>
            <NavItem><NavLink className={classnames({ active: activeTab === '3' })} onClick={() => toggle('3')} style={{ cursor: 'pointer' }}>Bank & Category</NavLink></NavItem>
            {/* <NavItem><NavLink className={classnames({ active: activeTab === '4' })} onClick={() => toggle('4')} style={{ cursor: 'pointer' }}>Settings</NavLink></NavItem> */}
          </Nav>
        </CardHeader>
        <CardBody>
          <Form onSubmit={formik.handleSubmit}>
            <TabContent activeTab={activeTab}>
              {/* Tab 1: Basic Info */}
              <TabPane tabId="1">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Title *</Label>
                      <Input type="text" {...formik.getFieldProps("title")} className={formik.errors.title ? "is-invalid" : ""} placeholder="Enter title" />
                      {formik.errors.title && <div className="invalid-feedback d-block">{formik.errors.title}</div>}
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea" rows="3" {...formik.getFieldProps("description")} placeholder="Optional description" />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label> Image ({allowedExtensionsImage.join('/')}, max {maxFileSize / (1024 * 1024)}MB) {!isEdit && "*"}</Label>
                      <Input type="file" accept={allowedExtensionsImage.join(',')} onChange={handleItemImage} innerRef={fileItemImgRef} className={itemImgErr ? "is-invalid" : ""} />
                      {formik.touched.image && formik.errors.image && <div className="invalid-feedback d-block">{formik.errors.image}</div>}
                      {itemImgErr && <div className="text-danger mt-1">{itemImgErr}</div>}
                      {showItemImg && <img src={showItemImg} alt="Preview" style={{ height: "100px", width: "100px", objectFit: "cover", borderRadius: "8px", border: "2px solid #ddd", marginTop: "10px" }} />}
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Tab 2: Links & Discounts */}
              <TabPane tabId="2">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Link URL</Label>
                      <Input type="url" {...formik.getFieldProps("link_url")} placeholder="https://example.com" />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Discount %</Label>
                      <Input type="number" {...formik.getFieldProps("discount_percentage")} placeholder="Optional discount" />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Discount Text</Label>
                      <Input type="text" {...formik.getFieldProps("discount_text")} placeholder="e.g., Upto 20% Off" />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Badge Text</Label>
                      <Input type="text" {...formik.getFieldProps("badge_text")} placeholder="Optional badge text" />

                   
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Badge Color</Label>
                      <Input type="color" {...formik.getFieldProps("badge_color")} />
                                                            {formik.errors.badge_color && <div className="invalid-feedback d-block">{formik.errors.badge_color}</div>}

                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Tab 3: Bank & Category */}
              <TabPane tabId="3">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Bank *</Label>
                      <AsyncSelect value={selectedBank} 
                        onChange={(val) => {
                          setSelectedBank(val);
                          formik.setFieldValue('bank_id', val ? val.value : null);
                        }} loadOptions={loadBankOptions} defaultOptions isClearable placeholder="Select bank..." />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Category *</Label>
                      <AsyncSelect value={selectedCategory} onChange={(val) => {
                        setSelectedCategory(val);
                        formik.setFieldValue('category_id', val ? val.value : null);
                      }} loadOptions={loadCategoryOptions} defaultOptions isClearable placeholder="Select category..." />
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>

              {/* Tab 4: Settings */}
              <TabPane tabId="4">
                <Row>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <Label>Sort Order</Label>
                      <Input type="number" {...formik.getFieldProps("sort_order")} placeholder="0" />
                    </FormGroup>
                  </Col>
                  <Col md="6" className="mb-3">
                    <FormGroup>
                      <div className="d-flex gap-3 mt-4">
                        <div className="form-check">
                          <Input type="checkbox" {...formik.getFieldProps("is_active")} checked={formik.values.is_active} className="form-check-input" />
                          <Label check>Active</Label>
                        </div>
                        <div className="form-check">
                          <Input type="checkbox" {...formik.getFieldProps("is_featured")} checked={formik.values.is_featured} className="form-check-input" />
                          <Label check>Featured</Label>
                        </div>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>

            <div className="mt-4 pt-3 border-top">
              <Button color="primary" type="submit" disabled={AlsoBuyCreateMutation.isLoading || AlsoBuyUpdateMutation.isLoading}>
                {(AlsoBuyCreateMutation.isLoading || AlsoBuyUpdateMutation.isLoading) ? <ButtonLoader /> : isEdit ? "Update Item" : "Create Item"}
              </Button>
              <Button color="secondary" type="button" onClick={() => navigate("/promotions/also-buy")} className="ms-2">Cancel</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};

export default AlsoBuyForm;
