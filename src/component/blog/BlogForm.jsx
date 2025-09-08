import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import { useFormik } from 'formik'
// import { BlogFormValidation } from '../../helper/ValidationHelper/Validation'
import validateFileImage from '../../utils/ValidationImage'
import Editor from '../../utils/Editor'
import Swal from 'sweetalert2'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BlogServices from '../../services/BlogServices'
import slugify from "slugify";
import ButtonLoader from '../../utils/Loader/ButtonLoader'
import { useNavigate, useParams } from 'react-router-dom'
import { useCustomQuery } from '../../utils/QueryHooks'
import config from '../../../config'
import CategoryServices from '../../services/CategoryServices'
import { buildQueryString } from '../../utils/BuildQuery'
import AsyncSelect from 'react-select/async';
// import FAQSection from './FAQSection';
// import EntitiesKeywords from './EntitiesKeywords';

const BlogForm = ({ title, categorySlug }) => {
  const { slug } = useParams()
  const [decodeSlug, setDecodeSlug] = useState(false)

  const allowedExtensionsImage = [".jpg", ".jpeg", ".png"]
  const [coverImg, setCoverImg] = useState(null);
  const [showCoverImg, setShowCoverImg] = useState(null);
  const [coverImgErr, setCoverImgErr] = useState("");
  const queryClient = useQueryClient()
  const navigate = useNavigate()



  const fileCoverImgRef = useRef(null);

  const initialValues = {
    title: "",
    slug: "",
    content: "",
    is_published: false,
    category_id: "",
    category_name: "",
    // GEO fields
    ai_summary: "",
    faq_section: [],
    schema_type: "Article",
    entities_keywords: []
  }

  const formik = useFormik({
    initialValues,
    // validationSchema: BlogFormValidation,
    onSubmit: (values) => {
      submitHandler(values);
    }
  });

  const handleCoverImage = async(e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const isFileValid = await validateFileImage(file, 2, allowedExtensionsImage);
    if (!isFileValid?.isValid) {
      setCoverImgErr(isFileValid?.errorMessage);
      return;
    }

    setCoverImg(file);
    setShowCoverImg(URL.createObjectURL(file));
    setCoverImgErr("");
  };

  const handleEditorChange = (e) => {
    formik.setFieldValue("content", e.htmlValue);
    formik.setFieldTouched("content", true);
  };

  const submitHandler = (data) => {
    console.log("Form Submitted:", data, coverImg);
    const formData = new FormData()
    formData.append("title", data?.title)
    formData.append("slug", data?.slug)
    formData.append("content", data?.content)
    formData.append("category_id", data?.category_id)
    formData.append("is_published", data?.is_published)
    
    // GEO fields
    if (data?.ai_summary) {
      formData.append("ai_summary", data?.ai_summary)
    }
    if (data?.faq_section && data?.faq_section.length > 0) {
      formData.append("faq_section", JSON.stringify(data?.faq_section))
    }
    if (data?.schema_type) {
      formData.append("schema_type", data?.schema_type)
    }
    if (data?.entities_keywords && data?.entities_keywords.length > 0) {
      formData.append("entities_keywords", JSON.stringify(data?.entities_keywords))
    }
    
    if (coverImg) {
      formData.append("cover_image", coverImg)
    }


    if (decodeSlug) {
      formData.append("slugId", decodeSlug)
      updatemutation.mutate(formData)
      return
    }
    mutation.mutate(formData)
  };


  const mutation = useMutation(
    (formdata) => BlogServices.addBlog(formdata),

    {
      onSuccess: (data) => {
        if (!data?.data?.status) {
          Swal.fire({
            title: "Error",
            text: data?.data?.message,
            icon: "error",
          });
          return
        }


        Swal.fire({
          title: "Successful",
          text: "Blog created  Successfully",
          icon: "success",
        });
        formik.resetForm()
        setCoverImg(false)
        setCoverImgErr("")
        setShowCoverImg(false)

        queryClient.refetchQueries(["blog-details", data?.data?.data?.slug])
        queryClient.refetchQueries(["blog-list", 1])
        navigate("/cms/blog/" + btoa(data?.data?.data?.slug))

        return;
      },
      onError: (err) => {
        Swal.fire({
          title: "Error",
          text: err?.response?.data?.message || err?.message,
          icon: "error",
        });
        return;
      },
    }
  );
  const updatemutation = useMutation(
    (formdata) => BlogServices.updateBlogBySlug(formdata),

    {
      onSuccess: (data) => {
        if (!data?.data?.status) {
          Swal.fire({
            title: "Error",
            text: data?.data?.message,
            icon: "error",
          });
          return
        }


        Swal.fire({
          title: "Successful",
          text: "Blog updated  Successfully",
          icon: "success",
        });
        formik.resetForm()
        setCoverImg(false)
        setCoverImgErr("")
        setShowCoverImg(false)

        queryClient.refetchQueries(["blog-details", data?.data?.data?.slug])
        queryClient.refetchQueries(["blog-list", 1])
        navigate("/cms/blog/" + btoa(data?.data?.data?.slug))


        return;
      },
      onError: (err) => {
        Swal.fire({
          title: "Error",
          text: err?.response?.data?.message || err?.message,
          icon: "error",
        });
        return;
      },
    }
  );





  // Get By Slug
  const {
    data,
    isLoading,
  } = useCustomQuery({
    queryKey: ['blog-details', decodeSlug],
    service: BlogServices.blogBySlug,
    params: { slug: decodeSlug },
    enabled: !!decodeSlug,
    staleTime: 0,
    select: (data) => {
      if (!data?.data?.status) {
        Swal.fire({
          title: "Error",
          text: data?.data?.message,
          icon: "error",
        });
        return
      }
      return data?.data?.data;
    },
    errorMsg: "",
    onSuccess: (data) => {

      formik.setFieldValue("title", data?.title)
      formik.setFieldValue("content", data?.content)
      formik.setFieldValue("slug", data?.slug)
      formik.setFieldValue("is_published", data?.is_published)
      
      // GEO fields
      formik.setFieldValue("ai_summary", data?.ai_summary || "")
      formik.setFieldValue("faq_section", data?.faq_section || [])
      formik.setFieldValue("schema_type", data?.schema_type || "Article")
      formik.setFieldValue("entities_keywords", data?.entities_keywords || [])
      
      if (data?.cover_image) {
        formik.setFieldValue("slugId", decodeSlug)
        setShowCoverImg(config.apiUrl + "/" + data?.cover_image)
      }

      if (data?.category) {
        formik.setFieldValue("category_id", data?.category?.id)
        formik.setFieldValue("category_name", data?.category?.name)
      }




    }
  });




  const handleCustomFormik = (e) => {
    const generatedSlug = slugify(e?.target?.value, {
      lower: true,
      strict: true,
    });
    formik.setFieldValue("slug", generatedSlug);
    formik.handleChange(e)
  }


  const handleSearchCategory = async (inputValue) => {
    try {
      const response = await CategoryServices.categoryList(buildQueryString([{
        key: "page", value: 1,
      }, {
        key: "limit", value: 10

      }, {
        key: "parent_slug", value: categorySlug
      },
      {
        key: "filter", value: "slug"
      },
      {
        key: "search", value: inputValue
      }
      ]));


      return response?.data?.data?.map((category) => ({
        label: category.name, // Adjust based on your API response
        value: category.id, // Use the actual unique identifier
        // id: category.id
      })) || [];
    } catch (error) {
      console.error("Error fetching Category list:", error);
      return [];
    }
  }


  // useEffect(() => {
  //   if (formik.values.title && !decodeSlug) {
  //     const generatedSlug = slugify(formik.values.title, {
  //       lower: true,
  //       strict: true,
  //     });
  //     formik.setFieldValue("slug", generatedSlug);
  //   }
  // }, [formik.values.title, decodeSlug]);




  useEffect(() => {
    try {
      const decodeSlug = slug && atob(slug);

      slug && setDecodeSlug(() => decodeSlug || "");
    } catch (error) {
      // console.error("Error decoding user ID:", error.message);
      // Handle the error gracefully, e.g., display an error message to the user
      navigate(-1)
    }
  }, [slug]);






  return (
    <>
      <h1>{title}</h1>

      <Form onSubmit={formik.handleSubmit}>
        <Row>
          {/* Category */}
          <Col md="6" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Category *</Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={handleSearchCategory}
                placeholder="Search Category..."
                value={
                  formik.values.category_id
                    ? {
                      label: formik.values.category_name, // You might need to store the name too
                      value: formik.values.category_id,
                    }
                    : null
                }
                onChange={(selectedOption) => {
                  formik.setFieldValue('category_id', selectedOption?.value || '');
                  formik.setFieldValue('category_name', selectedOption?.label || ''); // optional, if you want to store label too
                }}
                onBlur={() => formik.setFieldTouched('category_id', true)}
              />
              {formik.touched.category_id && formik.errors.category_id && (
                <p className="text-danger">{formik.errors.category_id}</p>
              )}
            </FormGroup>
          </Col>
          {/* Title */}
          <Col md="6" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Title *</Label>
              <Input
                type="text"
                {...formik.getFieldProps("title")}
                autoComplete="new-title"
                onChange={(e) => {
                  handleCustomFormik(e


                  )

                }}
                className={formik.touched.title && formik.errors.title ? "is-invalid" : ""}
              />
              {formik.touched.title && <p className="text-danger">{formik.errors.title}</p>}
            </FormGroup>
          </Col>

          {/* Slug */}
          <Col md="6" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Slug *</Label>
              <Input
                type="text"
                {...formik.getFieldProps("slug")}
                autoComplete="new-slug"
                className={formik.touched.slug && formik.errors.slug ? "is-invalid" : ""}
              />
              {formik.touched.slug && <p className="text-danger">{formik.errors.slug}</p>}
            </FormGroup>
          </Col>

          {/* Content */}
          <Col md="12" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Content *</Label>
              <Editor
                text={formik.values.content}
                handleEditorChange={handleEditorChange}
              />
              {formik.touched.content && <p className="text-danger">{formik.errors.content}</p>}
            </FormGroup>
          </Col>

          {/* Cover Image */}
          <Col md="6" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Blog Image (jpg/jpeg/png, max 2MB)</Label>
              <Input
                type="file"
                name="cover_image"
                accept={allowedExtensionsImage}
                onChange={handleCoverImage}
                innerRef={fileCoverImgRef}
                autoComplete="new-cover_image"
                className={coverImgErr ? "is-invalid" : ""}
              />
              {coverImgErr && <p className="text-danger">{coverImgErr}</p>}
              {showCoverImg && (
                <div className="upload-review mt-2">
                  <img
                    src={showCoverImg}
                    alt="Cover Preview"
                    className="img-fluid"
                    height={100}
                    width={100}
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                </div>
              )}
            </FormGroup>
          </Col>

          {/* Is Published */}
          <Col md="6" className="mb-2">
            <FormGroup className="common-formgroup">
              <Label>Published</Label>
              <div className="d-flex gap-3">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="radio"
                      name="is_published"
                      value={true}
                      checked={formik.values.is_published === true}
                      onChange={() => formik.setFieldValue("is_published", true)}
                    />{" "}
                    Yes
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="radio"
                      name="is_published"
                      value={false}
                      checked={formik.values.is_published === false}
                      onChange={() => formik.setFieldValue("is_published", false)}
                    />{" "}
                    No
                  </Label>
                </FormGroup>
              </div>
              {formik.touched.is_published && <p className="text-danger">{formik.errors.is_published}</p>}
            </FormGroup>
          </Col>

          {/* GEO Section */}
          <Col md="12" className="mb-4">
            <div className="geo-section">
              <h4 className="mb-3">Generative Engine Optimization (GEO)</h4>
              
              {/* AI Summary */}
              <Row>
                <Col md="12" className="mb-3">
                  <FormGroup className="common-formgroup">
                    <Label>AI Summary</Label>
                    <Input
                      type="textarea"
                      {...formik.getFieldProps("ai_summary")}
                      placeholder="Enter a short factual summary (1-2 sentences) for AI extraction..."
                      rows="3"
                      className={formik.touched.ai_summary && formik.errors.ai_summary ? "is-invalid" : ""}
                    />
                    <small className="text-muted">
                      Provide a concise factual summary that AI can extract and use for search results.
                    </small>
                    {formik.touched.ai_summary && formik.errors.ai_summary && (
                      <p className="text-danger">{formik.errors.ai_summary}</p>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              {/* Schema Type */}
              <Row>
                <Col md="6" className="mb-3">
                  <FormGroup className="common-formgroup">
                    <Label>Schema Type</Label>
                    <Input
                      type="select"
                      {...formik.getFieldProps("schema_type")}
                      className={formik.touched.schema_type && formik.errors.schema_type ? "is-invalid" : ""}
                    >
                      <option value="Article">Article</option>
                      <option value="FAQPage">FAQ Page</option>
                      <option value="Product">Product</option>
                      <option value="HowTo">How-To</option>
                      <option value="BlogPosting">Blog Posting</option>
                      <option value="NewsArticle">News Article</option>
                    </Input>
                    <small className="text-muted">
                      Select the appropriate schema.org type for structured data.
                    </small>
                    {formik.touched.schema_type && formik.errors.schema_type && (
                      <p className="text-danger">{formik.errors.schema_type}</p>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              {/* Entities & Keywords */}
              {/* <Row>
                <Col md="12" className="mb-3">
                  <EntitiesKeywords
                    value={formik.values.entities_keywords}
                    onChange={(value) => formik.setFieldValue("entities_keywords", value)}
                  />
                </Col>
              </Row> */}

              {/* FAQ Section */}
              {/* <Row>
                <Col md="12" className="mb-3">
                  <FAQSection
                    value={formik.values.faq_section}
                    onChange={(value) => formik.setFieldValue("faq_section", value)}
                  />
                </Col>
              </Row> */}
            </div>
          </Col>

          {/* Submit */}
          <Col md="12">
            <FormGroup>
              <Button
                className="btn btn-style1 px-4 py-2"
                type="submit"
                disabled={mutation?.isLoading || updatemutation?.isLoading}

              >
                {
                  mutation.isLoading || updatemutation?.isLoading ? <ButtonLoader /> : 'Save'
                }

              </Button>
            </FormGroup>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default BlogForm;
