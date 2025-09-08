import React, { useState, useEffect } from 'react';
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
  ModalFooter
} from 'reactstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoMdAdd, IoMdTrash } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import Wrapper from '../layouts/Wrapper';
import CmsServices from '../services/CmsServices';
import { useCustomQuery } from '../utils/QueryHooks';

const HomeCms = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [activeSection, setActiveSection] = useState('hero_banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    button_text: '',
    button_url: '',
    button_text_secondary: '',
    button_url_secondary: '',
    image_url: '',
    background_image: '',
    sort_order: 0,
    is_active: true
  });
  const [files, setFiles] = useState({
    image: null,
    background_image: null
  });
  const [formErrors, setFormErrors] = useState({});

  // Home page sections configuration
  const homeSections = [
    {
      key: 'hero_banner',
      name: 'Hero Banner Section',
      description: 'Main hero section with background image and content',
      content_type: 'slider',
      fields: [ 'background_image'],
      validationRules: {
        // title: { required: false },
        // subtitle: { required: false },
        // content: { required: false },
        // button_text: { required: false },
        // button_url: { required: false, type: 'url' },
        background_image: { required: false, type: 'image' }
      }
    },
    {
      key: 'app_download',
      name: 'App Download Section',
      description: 'Left content with download buttons, right side image',
      content_type: 'banner',
      fields: ['title', 'content', 'button_text', 'button_url', 'button_text_secondary', 'button_url_secondary', 'image_url'],
      validationRules: {
        title: { required: true },
        content: { required: true },
        button_text: { required: false },
        button_url: { required: false, type: 'url' },
        button_text_secondary: { required: false },
        button_url_secondary: { required: false, type: 'url' },
        image_url: { required: false, type: 'image' }
      }
    }
  ];

  // Fetch homepage content
  const {
    data: homeContent,
    isLoading: isContentLoading,
    refetch: refetchContent
  } = useCustomQuery({
    queryKey: ['home-cms-content'],
    service: () => CmsServices.getPageContent('homepage'),
    select: (data) => data?.content || [],
    errorMsg: ''
  });

  // Validation function
  const validateForm = () => {
    const errors = {};
    const currentSection = homeSections.find(s => s.key === activeSection);
    
    if (!currentSection) return false;

    // Validate based on section rules
    Object.keys(currentSection.validationRules).forEach(fieldName => {
      const rule = currentSection.validationRules[fieldName];
      const value = formData[fieldName];

      // Required field validation
      if (rule.required && (!value || !value.toString().trim())) {
        errors[fieldName] = `${fieldName.replace('_', ' ')} is required`;
      }

      // URL validation
      if (rule.type === 'url' && value && value.trim() && !isValidUrl(value.trim())) {
        errors[fieldName] = 'Please enter a valid URL';
      }

      // Image validation for file uploads
      if (rule.type === 'image' && fieldName === 'image_url' && !formData.image_url && !files.image) {
        // Only show error if it's required
        if (rule.required) {
          errors[fieldName] = 'Image is required';
        }
      }

      if (rule.type === 'image' && fieldName === 'background_image' && !formData.background_image && !files.background_image) {
        // Only show error if it's required
        if (rule.required) {
          errors[fieldName] = 'Background image is required';
        }
      }
    });

    // Custom validation for app download section
    if (activeSection === 'app_download') {
      // At least one button should be provided if button text is provided
      if (formData.button_text && !formData.button_url) {
        errors.button_url = 'Button URL is required when button text is provided';
      }
      if (formData.button_text_secondary && !formData.button_url_secondary) {
        errors.button_url_secondary = 'Secondary button URL is required when button text is provided';
      }
    }

    // File size validation
    if (files.image && files.image.size > 5 * 1024 * 1024) { // 5MB
      errors.image = 'Image size should be less than 5MB';
    }
    if (files.background_image && files.background_image.size > 5 * 1024 * 1024) { // 5MB
      errors.background_image = 'Background image size should be less than 5MB';
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (files.image && !allowedTypes.includes(files.image.type)) {
      errors.image = 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }
    if (files.background_image && !allowedTypes.includes(files.background_image.type)) {
      errors.background_image = 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      // Try with https:// prefix if it doesn't have protocol
      try {
        new URL(`https://${string}`);
        return true;
      } catch (_) {
        return false;
      }
    }
  };

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: (data) => {
      const formDataObj = new FormData();
      
      // Append text fields
      Object.keys(data.textData).forEach(key => {
        if (data.textData[key] !== null && data.textData[key] !== undefined && data.textData[key] !== '') {
          formDataObj.append(key, data.textData[key]);
        }
      });
      
      // Append files
      if (data.files.image) {
        formDataObj.append('image', data.files.image);
      }
      if (data.files.background_image) {
        formDataObj.append('background_image', data.files.background_image);
      }
      
      // Update or create based on editingContent
      if (editingContent) {
        return CmsServices.updateCmsContent(editingContent.id, formDataObj);
      } else {
        return CmsServices.createCmsContent(formDataObj);
      }
    },
    onSuccess: (response) => {
      const message = editingContent ? 'Content updated successfully' : 'Content created successfully';
      Swal.fire({
        title: 'Success!',
        text: message,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      resetForm();
      setIsModalOpen(false);
      refetchContent();
      queryClient.invalidateQueries(['home-cms-content']);
    },
    onError: (error) => {
      console.error('CMS content error:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Failed to save content';
      setServerError(errorMessage);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => CmsServices.deleteCmsContent({ id }),
    onSuccess: () => {
      Swal.fire({
        title: 'Deleted!',
        text: 'Content deleted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      refetchContent();
      queryClient.invalidateQueries(['home-cms-content']);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      setServerError(error?.response?.data?.message || 'Failed to delete content');
    }
  });

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setServerError('');
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
      
      // Clear file-related errors
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    const currentSection = homeSections.find(s => s.key === activeSection);
    
    // Prepare submit data with only relevant fields
    const submitData = {
      textData: {
        page_type: 'homepage',
        page_identifier: '',
        section_name: activeSection,
        content_type: currentSection.content_type,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active
      },
      files
    };

    // Add only the fields that are relevant for this section
    currentSection.fields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== '') {
        submitData.textData[field] = formData[field];
      }
    });

    createUpdateMutation.mutate(submitData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      content: '',
      button_text: '',
      button_url: '',
      button_text_secondary: '',
      button_url_secondary: '',
      image_url: '',
      background_image: '',
      sort_order: 0,
      is_active: true
    });
    setFiles({
      image: null,
      background_image: null
    });
    setFormErrors({});
    setServerError('');
    setEditingContent(null);
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title || '',
      subtitle: content.subtitle || '',
      content: content.content || '',
      button_text: content.button_text || '',
      button_url: content.button_url || '',
      button_text_secondary: content.button_text_secondary || '',
      button_url_secondary: content.button_url_secondary || '',
      image_url: content.image_url || '',
      background_image: content.background_image || '',
      sort_order: content.sort_order || 0,
      is_active: content.is_active ?? true
    });
    setActiveSection(content.section_name);
    setIsModalOpen(true);
  };

  const handleDelete = (content) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(content.id);
      }
    });
  };

  const openAddModal = (sectionKey) => {
    resetForm();
    setActiveSection(sectionKey);
    setIsModalOpen(true);
  };

  const getSectionContent = (sectionKey) => {
    return homeContent?.filter(content => content.section_name === sectionKey) || [];
  };

  const renderFormFields = () => {
    const currentSection = homeSections.find(s => s.key === activeSection);
    if (!currentSection) return null;

    return (
      <Row>
        {/* Title Field */}
        {currentSection.fields.includes('title') && (
          <Col md="6">
            <FormGroup>
              <Label for="title">
                Title {currentSection.validationRules?.title?.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                invalid={!!formErrors.title}
                placeholder="Enter title"
              />
              {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
            </FormGroup>
          </Col>
        )}

        {/* Subtitle Field */}
        {currentSection.fields.includes('subtitle') && (
          <Col md="6">
            <FormGroup>
              <Label for="subtitle">
                Subtitle {currentSection.validationRules?.subtitle?.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type="text"
                name="subtitle"
                id="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                invalid={!!formErrors.subtitle}
                placeholder="Enter subtitle"
              />
              {formErrors.subtitle && <div className="invalid-feedback">{formErrors.subtitle}</div>}
            </FormGroup>
          </Col>
        )}

        {/* Content Field */}
        {currentSection.fields.includes('content') && (
          <Col md="12">
            <FormGroup>
              <Label for="content">
                Content {currentSection.validationRules?.content?.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type="textarea"
                name="content"
                id="content"
                rows="4"
                value={formData.content}
                onChange={handleInputChange}
                invalid={!!formErrors.content}
                placeholder="Enter content description"
              />
              {formErrors.content && <div className="invalid-feedback">{formErrors.content}</div>}
            </FormGroup>
          </Col>
        )}

        {/* Primary Button Fields */}
        {currentSection.fields.includes('button_text') && (
          <>
            <Col md="6">
              <FormGroup>
                <Label for="button_text">
                  Button Text {currentSection.validationRules?.button_text?.required && <span className="text-danger">*</span>}
                </Label>
                <Input
                  type="text"
                  name="button_text"
                  id="button_text"
                  value={formData.button_text}
                  onChange={handleInputChange}
                  invalid={!!formErrors.button_text}
                  placeholder="e.g., Get it on Google Play"
                />
                {formErrors.button_text && <div className="invalid-feedback">{formErrors.button_text}</div>}
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="button_url">
                  Button URL {currentSection.validationRules?.button_url?.required && <span className="text-danger">*</span>}
                </Label>
                <Input
                  type="url"
                  name="button_url"
                  id="button_url"
                  value={formData.button_url}
                  onChange={handleInputChange}
                  invalid={!!formErrors.button_url}
                  placeholder="https://play.google.com/store/..."
                />
                {formErrors.button_url && <div className="invalid-feedback">{formErrors.button_url}</div>}
              </FormGroup>
            </Col>
          </>
        )}

        {/* Secondary Button Fields (for app download section) */}
        {currentSection.fields.includes('button_text_secondary') && (
          <>
            <Col md="6">
              <FormGroup>
                <Label for="button_text_secondary">
                  Secondary Button Text {currentSection.validationRules?.button_text_secondary?.required && <span className="text-danger">*</span>}
                </Label>
                <Input
                  type="text"
                  name="button_text_secondary"
                  id="button_text_secondary"
                  value={formData.button_text_secondary}
                  onChange={handleInputChange}
                  invalid={!!formErrors.button_text_secondary}
                  placeholder="e.g., Download on the App Store"
                />
                {formErrors.button_text_secondary && <div className="invalid-feedback">{formErrors.button_text_secondary}</div>}
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="button_url_secondary">
                  Secondary Button URL {currentSection.validationRules?.button_url_secondary?.required && <span className="text-danger">*</span>}
                </Label>
                <Input
                  type="url"
                  name="button_url_secondary"
                  id="button_url_secondary"
                  value={formData.button_url_secondary}
                  onChange={handleInputChange}
                  invalid={!!formErrors.button_url_secondary}
                  placeholder="https://apps.apple.com/..."
                />
                {formErrors.button_url_secondary && <div className="invalid-feedback">{formErrors.button_url_secondary}</div>}
              </FormGroup>
            </Col>
          </>
        )}

        {/* Main Image Field */}
        {currentSection.fields.includes('image_url') && (
          <Col md="6">
            <FormGroup>
              <Label for="image">
                Main Image {currentSection.validationRules?.image_url?.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                invalid={!!formErrors.image}
              />
              <small className="text-muted">Supported: JPG, PNG, GIF, WebP (Max: 5MB)</small>
              {formErrors.image && <div className="invalid-feedback">{formErrors.image}</div>}
              {formData.image_url && !files.image && (
                <small className="text-info d-block mt-1">Current: {formData.image_url.split('/').pop()}</small>
              )}
            </FormGroup>
          </Col>
        )}

        {/* Background Image Field */}
        {currentSection.fields.includes('background_image') && (
          <Col md="6">
            <FormGroup>
              <Label for="background_image">
                Background Image {currentSection.validationRules?.background_image?.required && <span className="text-danger">*</span>}
              </Label>
              <Input
                type="file"
                name="background_image"
                id="background_image"
                accept="image/*"
                onChange={handleFileChange}
                invalid={!!formErrors.background_image}
              />
              <small className="text-muted">Supported: JPG, PNG, GIF, WebP (Max: 5MB)</small>
              {formErrors.background_image && <div className="invalid-feedback">{formErrors.background_image}</div>}
              {formData.background_image && !files.background_image && (
                <small className="text-info d-block mt-1">Current: {formData.background_image.split('/').pop()}</small>
              )}
            </FormGroup>
          </Col>
        )}

        {/* Status Field */}
        {/* <Col md="6">
          <FormGroup check className="mt-4">
            <Label check>
              <Input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              Is Active
            </Label>
          </FormGroup>
        </Col> */}
      </Row>
    );
  };

  if (isContentLoading) {
    return (
      <Wrapper>
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
          <Spinner size="lg" color="primary" />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="blog-header">
        <div className="admin-heading-header">
          <h1>Home CMS Management</h1>
          <p className="text-muted">Manage your homepage content sections</p>
        </div>
      </div>

      {serverError && (
        <Alert color="danger" className="mb-4">
          {serverError}
          <Button 
            close 
            onClick={() => setServerError('')}
          />
        </Alert>
      )}

      <Row>
        {homeSections.map((section) => {
          const sectionContent = getSectionContent(section.key);
          return (
            <Col md="6" key={section.key} className="mb-4">
              <Card className="h-100 section-card">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{section.name}</h5>
                    <small className="text-muted">{section.description}</small>
                  </div>
                  {/* Remove Add Content button for app_download section */}
                  {section.key !== 'app_download' && (
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => openAddModal(section.key)}
                    >
                      <IoMdAdd /> Add Content
                    </Button>
                  )}
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <span className="badge badge-info">Content Items: {sectionContent.length}</span>
                  </div>
                  
                  {sectionContent.length > 0 ? (
                    <div className="content-list">
                      {sectionContent.map((content, index) => (
                        <div key={content.id} className="content-item border rounded p-3 mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{content.title || 'Untitled Content'}</h6>
                              {content.subtitle && (
                                <p className="text-muted small mb-1">Subtitle: {content.subtitle}</p>
                              )}
                              {content.content && (
                                <p className="text-muted small mb-1">
                                  {content.content.substring(0, 100)}...
                                </p>
                              )}
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <span className={`badge ${content.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                  {content.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {content.image_url && (
                                  <span className="badge badge-info">Has Image</span>
                                )}
                                {content.button_text && (
                                  <span className="badge badge-warning">Has Button</span>
                                )}
                              </div>
                            </div>
                            {/* Remove action buttons for app_download section */}
                            {section.key !== 'app_download' && (
                              <div className="btn-group btn-group-sm ml-2">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => handleEdit(content)}
                                  title="Edit"
                                >
                                  <BiEdit />
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDelete(content)}
                                  title="Delete"
                                >
                                  <IoMdTrash />
                                </Button>
                              </div>
                            )}
                            {/* For app_download section, only show edit button */}
                            {section.key === 'app_download' && (
                              <div className="btn-group btn-group-sm ml-2">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => handleEdit(content)}
                                  title="Edit"
                                >
                                  <BiEdit />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert color="light" className="text-center">
                      <p className="mb-0">No content added yet</p>
                      {section.key !== 'app_download' && (
                        <small className="text-muted">Click "Add Content" to get started</small>
                      )}
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        toggle={() => setIsModalOpen(false)} 
        size="lg"
        backdrop="static"
      >
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          {editingContent ? 'Edit' : 'Add'} Content - {homeSections.find(s => s.key === activeSection)?.name}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody>
            {serverError && (
              <Alert color="danger">
                {serverError}
              </Alert>
            )}
            {renderFormFields()}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={createUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              type="submit"
              disabled={createUpdateMutation.isPending}
            >
              {createUpdateMutation.isPending ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {editingContent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingContent ? 'Update Content' : 'Create Content'
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Wrapper>
  );
};

export default HomeCms;