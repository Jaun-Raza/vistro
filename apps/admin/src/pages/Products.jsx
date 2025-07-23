import { useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import ReactMarkdown from 'react-markdown';
import { useAddBundleToProductMutation, useAddImageToProductMutation, useAddProductMutation, useEditProductMutation, useProductsDataQuery, useRemoveBundleToProductMutation, useRemoveImageToProductMutation, useRemoveProductMutation, useToggleVisibleFuncMutation } from '../RTK/ApiRequests.js';

const Products = () => {

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useProductsDataQuery(page);

  const [toggleVisibleFunc] = useToggleVisibleFuncMutation();
  const [addProduct] = useAddProductMutation();
  const [editProduct] = useEditProductMutation();
  const [removeProduct] = useRemoveProductMutation();
  const [addImageToProduct] = useAddImageToProductMutation();
  const [removeImageToProduct] = useRemoveImageToProductMutation();
  const [addBundleToProduct] = useAddBundleToProductMutation();
  const [removeBundleToProduct] = useRemoveBundleToProductMutation();

  const [showPopup, setShowPopup] = useState(false);
  const [productData, setProductData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    tagline: '',
    description: '',
    price: 0,
    licenses: {
      personal: 0,
      commercial: 0
    },
    download: '',
    bundlesPersonal: [],
    bundlesCommercial: [],
    tags: [],
    category: '',
    caption: '',
    images: []
  });
  const [newBundle, setNewBundle] = useState({
    id: '',
    name: '',
    price: 0,
    description: '',
    download: '',
    type: 'personal',
    image: null,
    imageSource: 'placeholder'
  });
  const [showBundleForm, setShowBundleForm] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [showImageUploadForm, setShowImageUploadForm] = useState(false);

  const [imageSource, setImageSource] = useState('placeholder');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentProductForImage, setCurrentProductForImage] = useState(null);
  const [editProductData, setEditProductData] = useState({
    id: '',
    name: '',
    tagline: '',
    description: '',
    licenses: {
      personal: 0,
      commercial: 0
    },
    download: '',
    tags: [],
    category: '',
    caption: '',
  });

  const [newTags, setNewTags] = useState("")

  const generateId = () => {
    return Date.now().toString();
  };

  const viewDetail = (data) => {
    setShowPopup(true);
    setProductData(data);
  };

  const toggleVisible = async (productId) => {
    try {
      const res = await toggleVisibleFunc({ productId })
      if (!res?.data?.success) {
        console.log(res?.data);
        alert(res?.data?.error);
      } else {
        alert(res?.data?.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      alert(error)
    }
  }

  const editProductFunc = async (e) => {
    e.preventDefault();

    try {
      const res = await editProduct({ editProduct: editProductData });

      if (!res?.data?.success) {
        console.log(res?.data);
        alert(res?.data?.error);
      } else {
        alert(res?.data?.message);
        setEditProductData({
          id: '',
          name: '',
          tagline: '',
          description: '',
          price: 0,
          licenses: {
            personal: 0,
            commercial: 0
          },
          images: [],
          tags: [],
          download: '',
          category: '',
          caption: '',
        });
        setShowEditForm(false);
      }
    } catch (error) {
      alert(error);
    }
  }

  const removeTag = async (tag, action) => {
    if (action === 'edit') {
      setEditProductData((prev) => ({
        ...prev,
        tags: prev?.tags?.filter((currTag) => currTag !== tag)
      }))
    } else {
      setNewProduct((prev) => ({
        ...prev,
        tags: prev?.tags?.filter((currTag) => currTag !== tag)
      }))
    }
  }

  const removeBundle = async (productId, bundleId, bundleType) => {
    if (window.confirm('Are you sure you want to remove this bundle?')) {
      try {
        const res = await removeBundleToProduct({ productId, bundleId, bundleType });

        if (!res?.data?.success) {
          console.log(res?.data);
          alert(res?.error?.data?.error);
        } else {
          alert(res?.data?.message);
          window.location.reload();
        }
      } catch (error) {
        alert(error);
      }
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await removeProduct({ productId: id });

        if (!res?.data?.success) {
          console.log(res?.data);
          alert(res?.error?.data?.error);
        } else {
          alert(res?.data?.message);
          window.location.reload();
        }
      } catch (error) {
        alert(error);
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const productId = generateId();
    const productToAdd = {
      ...newProduct,
      id: productId,
      images: [],
      bundlesPersonal: [],
      bundlesCommercial: []
    };

    try {
      const res = await addProduct(productToAdd);

      if (!res?.data?.success) {
        console.log(res?.data);
        setErrorMessage(res?.data?.error);
      } else {
        setSuccessMessage(res?.data?.message);
        setNewProduct({
          id: '',
          name: '',
          tagline: '',
          description: '',
          price: 0,
          licenses: {
            personal: 0,
            commercial: 0
          },
          images: [],
          tags: [],
          download: '',
          category: '',
          caption: '',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const handleAddBundle = async (e) => {
    e.preventDefault();

    if (!currentProductId) return;

    const bundleId = `${newBundle.name.toLowerCase().replace(/\s+/g, '-')}-${newBundle.type}`;
    let bundleImage;

    if (newBundle.imageSource === 'placeholder') {
      bundleImage = "/placeholder.jpg";
    } else if (newBundle.imageSource === 'url' && imageUrl) {
      bundleImage = imageUrl;
    } else if (newBundle.imageSource === 'upload' && imagePreview) {
      bundleImage = imagePreview;
    } else {
      bundleImage = "/placeholder.jpg";
    }

    const bundleToAdd = {
      ...newBundle,
      id: bundleId,
      image: bundleImage
    };

    try {
      const res = await addBundleToProduct({
        productId: currentProductId,
        bundleToAdd
      });

      if (!res?.data?.success) {
        console.log(res?.data);
        setErrorMessage(res?.data?.error);
      } else {
        setNewBundle({
          id: '',
          name: '',
          price: 0,
          download: '',
          description: '',
          type: 'personal',
          imageSource: 'placeholder'
        });
        setImageUrl('');
        setUploadedImage(null);
        setImagePreview('');
        setShowBundleForm(false);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(error);
    }

  };

  const openBundleForm = (productId) => {
    setCurrentProductId(productId);
    setShowBundleForm(true);
    setImageSource('placeholder');
    setImageUrl('');
    setUploadedImage(null);
    setImagePreview('');
  };

  const openImageUploadForm = (productId) => {
    setCurrentProductForImage(productId);
    setShowImageUploadForm(true);
    setImageSource('placeholder');
    setImageUrl('');
    setUploadedImage(null);
    setImagePreview('');
  };

  const handleAddTags = (action) => {
    if (action === 'edit') {
      if (newTags.trim() !== "" && !editProductData?.tags?.includes(newTags.trim())) {
        setEditProductData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTags.trim()]
        }))

        setNewTags("")
      } else {
        setNewTags("")
      }
    } else {
      if (newTags.trim() !== "" && !newProduct?.tags?.includes(newTags.trim())) {
        setNewProduct((prev) => ({
          ...prev,
          tags: [...prev.tags, newTags.trim()]
        }))

        setNewTags("")
      } else {
        setNewTags("")
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!currentProductForImage) return;
    setErrorMessage('');
    setSuccessMessage('');

    let newImage;

    if (imageSource === 'placeholder') {
      newImage = "/placeholder.jpg"
    } else if (imageSource === 'url' && imageUrl) {
      newImage = imageUrl;
    } else if (imageSource === 'upload' && imagePreview) {
      newImage = imagePreview;
    } else {
      return;
    }

    try {
      const res = await addImageToProduct({
        productId: currentProductForImage,
        imageUrl: newImage
      });

      if (!res?.data?.success) {
        console.log(res?.data);
        setErrorMessage(res?.data?.error);
      } else {
        setSuccessMessage(res?.data?.message);
        setImageUrl('');
        setUploadedImage(null);
        setImagePreview('');
        setShowImageUploadForm(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(error);
    }

  };

  // Remove image from product
  const removeProductImage = async (productId, imageIndex) => {
    try {
      const res = await removeImageToProduct({ productId, imageIndex });

      if (!res?.data?.success) {
        console.log(res?.data);
        alert(res?.error?.data?.error);
      } else {
        alert(res?.data?.message);
        window.location.reload();
      }
    } catch (error) {
      alert(error);
    }
  };

  // Handle image source change for product form
  const handleProductImageSourceChange = (e) => {
    setImageSource(e.target.value);
  };

  // Handle image source change for bundle form
  const handleBundleImageSourceChange = (e) => {
    setNewBundle({ ...newBundle, imageSource: e.target.value });
  };

  return (
    <Wrapper>
      <div className="main">
        <h1>Product Management</h1>
        <div className="head">
          <div className="cards">
            <div className="card" style={{ backgroundColor: '#434ce6', color: '#fff' }}>
              <h3>Total Products <i className='fa fa-box'></i></h3>
              <span>{!data?.data?.fullLength ? 0 : data?.data?.fullLength} {data?.data?.fullLength > 1 ? 'Products' : 'Product'}</span>
            </div>
          </div>
          <div className="actions">
            <button
              className="addBtn"
              onClick={() => setShowAddForm(true)}
            >
              Add New Product
            </button>
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="table">
            <div className="pagination">
              <button
                onClick={() => setPage(page === 1 ? page : page - 1)}
                disabled={page === 1}
                style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                {'<'}
              </button>
              <span>
                Page {page} of {Math.ceil(data?.data?.fullLength / 5 || 0)}
              </span>
              <button
                onClick={() =>
                  setPage(page + 1)
                }
                disabled={page === Math.ceil(data?.data?.fullLength / 5)}
                style={{ cursor: page === Math.ceil(data?.data?.fullLength / 5) ? 'not-allowed' : 'pointer' }}
              >
                {'>'}
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Personal License</th>
                  <th>Commercial License</th>
                  <th>Images</th>
                  <th>Bundles</th>
                  <th>Is Visible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              {
                !isError ? <><tbody>
                  {data?.data?.products.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productId.slice(8, -1)}</td>
                      <td>{product?.productDetails?.name}</td>
                      <td>£{product.licenses.personal}</td>
                      <td>£{product.licenses.commercial}</td>
                      <td>
                        {product?.productDetails?.images?.length || 0} / 5 Images
                        {(product?.productDetails?.images?.length || 0) < 5 && (
                          <button
                            className="add-img"
                            onClick={() => openImageUploadForm(product.productId)}
                          >
                            +
                          </button>
                        )}
                      </td>
                      <td>
                        {product.bundlesPersonal.length + product.bundlesCommercial.length} Bundles
                        <button
                          className="add-bundle"
                          onClick={() => openBundleForm(product.productId)}
                        >
                          +
                        </button>
                      </td>
                      <td>{product.isVisible ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          className='detailsBtn'
                          onClick={() => viewDetail(product)}
                        >
                          Details
                        </button>
                        <button
                          className='toggleVisibleBtn'
                          onClick={() => toggleVisible(product?.productId)}
                        >
                          {!product?.isVisible ? 'Visible' : 'Invisible'}
                        </button>
                        <button
                          className='detailsBtn'
                          onClick={() => {
                            setEditProductData({
                              id: product?.productId,
                              name: product?.productDetails?.name,
                              tagline: product?.productDetails?.tagline,
                              description: product?.productDetails?.description,
                              download: product?.productDetails?.download,
                              licenses: {
                                personal: product?.licenses?.personal,
                                commercial: product?.licenses?.commercial
                              },
                              tags: product?.productDetails?.tags,
                              category: product?.productDetails?.category,
                              caption: product?.productDetails?.caption
                            });
                            setShowEditForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className='removeBtn'
                          onClick={() => deleteProduct(product.productId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody></> : <><h3>{error?.data?.error}</h3></>
              }
            </table>
          </div>
        )}
      </div>

      {showPopup && (
        <ProductInfoPopup
          product={productData}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          removeImage={removeProductImage}
          removeBundle={removeBundle}
        />
      )}

      {showAddForm && (
        <FormPopup title="Add New Product" setShowAddForm={setShowAddForm} setShowEditForm={setShowEditForm} setShowImageUploadForm={setShowImageUploadForm} setShowBundleForm={setShowBundleForm}>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                value={newProduct.tagline}
                onChange={(e) => setNewProduct({ ...newProduct, tagline: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Caption</label>
              <select onChange={(e) => setNewProduct({ ...newProduct, caption: e.target.value })}>
                <option value="Product" selected>Product</option>
                <option value="On Sale" selected>On Sale</option>
                <option value="Featured" selected>Featured</option>
              </select>
            </div>
            <div className="form-group">
              <label>Download Link</label>
              <input
                type="text"
                value={newProduct.download}
                onChange={(e) => setNewProduct({ ...newProduct, download: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                <option value="AUDIO" selected>AUDIO</option>
                <option value="CLOTHING" selected>CLOTHING</option>
                <option value="GAMES" selected>GAMES</option>
                <option value="GRAPHICS & UI" selected>GRAPHICS & UI</option>
                <option value="MAPS" selected>MAPS</option>
                <option value="MODELS" selected>MODELS</option>
                <option value="SCRIPTS" selected>SCRIPTS</option>
                <option value="VEHICLES" selected>VEHICLES</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
              <button onClick={() => {
                handleAddTags('add')
              }} type="button" className='tag-btn'>
                <i className='fa fa-plus'></i>
              </button>
            </div>
            <TagsWrapper>
              {newProduct?.tags?.map((tag) => (
                <div key={tag} className="tag">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag, 'add')}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              ))}
            </TagsWrapper>
            <div className="form-group">
              <label>Description (Markdown supported)</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="form-group">
              <label>Personal License Price</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.licenses?.personal || 0}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  licenses: {
                    ...newProduct.licenses,
                    personal: e.target.value < 1 ? 1 : parseFloat(e.target.value).toFixed(2)
                  }
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Commercial License Price</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.licenses?.commercial || 0}
                onChange={(e) => setNewProduct({
                  ...newProduct,
                  licenses: {
                    ...newProduct.licenses,
                    commercial: e.target.value < 1 ? 1 : parseFloat(e.target.value).toFixed(2)
                  }
                })}
                required
              />
            </div>
            {
              errorMessage !== '' ? <span className='error'>{errorMessage}</span> : null
            }
            {
              successMessage !== '' ? <span className='success'>{successMessage}</span> : null
            }
            <div className="form-actions">
              <button type="submit" className="saveBtn">Save Product</button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </FormPopup>
      )}

      {showEditForm && (
        <FormPopup title="Edit New Product" setShowAddForm={setShowAddForm} setShowEditForm={setShowEditForm} setShowImageUploadForm={setShowImageUploadForm} setShowBundleForm={setShowBundleForm}>
          <form onSubmit={editProductFunc}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={editProductData?.name}
                onChange={(e) => setEditProductData({ ...editProductData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input
                type="text"
                value={editProductData?.tagline}
                onChange={(e) => setEditProductData({ ...editProductData, tagline: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Caption</label>
               <select value={editProductData?.caption} onChange={(e) => setEditProductData({ ...editProductData, caption: e.target.value })}>
                <option value="Product" selected>Product</option>
                <option value="On Sale" selected>On Sale</option>
                <option value="Featured" selected>Featured</option>
              </select>
            </div>
            <div className="form-group">
              <label>Download Link</label>
              <input
                type="text"
                value={editProductData.download}
                onChange={(e) => setEditProductData({ ...editProductData, download: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={editProductData?.category} onChange={(e) => setEditProductData({ ...editProductData, category: e.target.value })}>
                <option value="AUDIO" selected>AUDIO</option>
                <option value="CLOTHING" selected>CLOTHING</option>
                <option value="GAMES" selected>GAMES</option>
                <option value="GRAPHICS & UI" selected>GRAPHICS & UI</option>
                <option value="MAPS" selected>MAPS</option>
                <option value="MODELS" selected>MODELS</option>
                <option value="SCRIPTS" selected>SCRIPTS</option>
                <option value="VEHICLES" selected>VEHICLES</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
              <button onClick={() => {
                handleAddTags('edit');
              }} type="button" className='tag-btn'>
                <i className='fa fa-plus'></i>
              </button>
            </div>
            <TagsWrapper>
              {editProductData?.tags?.map((tag) => (
                <div key={tag} className="tag">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag, 'edit')}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </div>
              ))}
            </TagsWrapper>
            <div className="form-group">
              <label>Description (Markdown supported)</label>
              <textarea
                value={editProductData?.description}
                onChange={(e) => setEditProductData({ ...editProductData, description: e.target.value })}
                rows={5}
                required
              />
            </div>
            <div className="form-group">
              <label>Personal License Price</label>
              <input
                type="number"
                step="0.01"
                value={editProductData?.licenses?.personal || 0}
                onChange={(e) => setEditProductData({
                  ...editProductData,
                  licenses: {
                    ...editProductData.licenses,
                    personal: e.target.value < 1 ? 1 : parseFloat(e.target.value).toFixed(2)
                  }
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Commercial License Price</label>
              <input
                type="number"
                step="0.01"
                value={editProductData?.licenses?.commercial || 0}
                onChange={(e) => setEditProductData({
                  ...editProductData,
                  licenses: {
                    ...editProductData.licenses,
                    commercial: e.target.value < 1 ? 1 : parseFloat(e.target.value).toFixed(2)
                  }
                })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="saveBtn">Save Product</button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </FormPopup>
      )}

      {/* Add Bundle Form */}
      {showBundleForm && (
        <FormPopup title="Add New Bundle" setShowAddForm={setShowAddForm} setShowEditForm={setShowEditForm} setShowImageUploadForm={setShowImageUploadForm} setShowBundleForm={setShowBundleForm}>
          <form onSubmit={handleAddBundle}>
            <div className="form-group">
              <label>Bundle Name</label>
              <input
                type="text"
                value={newBundle.name}
                onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Bundle Type</label>
              <select
                value={newBundle.type}
                onChange={(e) => setNewBundle({ ...newBundle, type: e.target.value })}
              >
                <option value="personal">Personal</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={newBundle.price}
                onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value < 1 ? 1 : parseFloat(e.target.value).toFixed(2) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description (Markdown supported)</label>
              <textarea
                value={newBundle.description}
                onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                rows={5}
              />
            </div>
            <div className="form-group">
              <label>Download Link</label>
              <input
                type="text"
                value={newBundle.download}
                onChange={(e) => setNewBundle({ ...newBundle, download: e.target.value })}
                required
              />
            </div>

            {/* Image Selection for Bundle */}
            <div className="form-group">
              <label>Bundle Image</label>
              <div className="image-source-options">
                <div>
                  <input
                    type="radio"
                    id="placeholder"
                    name="bundleImageSource"
                    value="placeholder"
                    checked={newBundle.imageSource === 'placeholder'}
                    onChange={handleBundleImageSourceChange}
                  />
                  <label htmlFor="placeholder">Use Placeholder</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="upload"
                    name="bundleImageSource"
                    value="upload"
                    checked={newBundle.imageSource === 'upload'}
                    onChange={handleBundleImageSourceChange}
                  />
                  <label htmlFor="upload">Upload Image</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="url"
                    name="bundleImageSource"
                    value="url"
                    checked={newBundle.imageSource === 'url'}
                    onChange={handleBundleImageSourceChange}
                  />
                  <label htmlFor="url">Image URL</label>
                </div>
              </div>

              {newBundle.imageSource === 'upload' && (
                <div className="upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              )}

              {newBundle.imageSource === 'url' && (
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="saveBtn">Add Bundle</button>
              <button
                type="button"
                className="cancelBtn"
                onClick={() => setShowBundleForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </FormPopup>
      )}

      {/* Add Image Form */}
      {showImageUploadForm && (
        <FormPopup title="Add Product Image" setShowAddForm={setShowAddForm} setShowEditForm={setShowEditForm} setShowImageUploadForm={setShowImageUploadForm} setShowBundleForm={setShowBundleForm}>
          <div className="form-group">
            <div className="image-source-options">
              <div>
                <input
                  type="radio"
                  id="placeholder-product"
                  name="productImageSource"
                  value="placeholder"
                  checked={imageSource === 'placeholder'}
                  onChange={handleProductImageSourceChange}
                />
                <label htmlFor="placeholder-product">Use Placeholder</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="upload-product"
                  name="productImageSource"
                  value="upload"
                  checked={imageSource === 'upload'}
                  onChange={handleProductImageSourceChange}
                />
                <label htmlFor="upload-product">Upload Image</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="url-product"
                  name="productImageSource"
                  value="url"
                  checked={imageSource === 'url'}
                  onChange={handleProductImageSourceChange}
                />
                <label htmlFor="url-product">Image URL</label>
              </div>
            </div>

            {imageSource === 'upload' && (
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            )}

            {imageSource === 'url' && (
              <input
                type="text"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            )}
          </div>
          {
            errorMessage !== '' ? <span className='error'>{errorMessage}</span> : null
          }
          {
            successMessage !== '' ? <span className='success'>{successMessage}</span> : null
          }
          <div className="form-actions">
            <button
              type="button"
              className="saveBtn"
              onClick={handleAddImage}
            >
              Add Image
            </button>
            <button
              type="button"
              className="cancelBtn"
              onClick={() => setShowImageUploadForm(false)}
            >
              Cancel
            </button>
          </div>
        </FormPopup>
      )}

      {/* <ConfirmationAlert
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleRemoveUser}
        title="Remove User"
        message={`Are you sure you want to remove the user with email: ${userToRemove?.email}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      /> */}
    </Wrapper>
  );
};

const ProductInfoPopup = ({ product, isOpen, onClose, removeImage, removeBundle }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <PopupOverlay onClick={handleOverlayClick}>
      <PopupContent>
        <PopupHeader>
          <h2>{product?.productDetails?.name}</h2>
          <button onClick={onClose}>&times;</button>
        </PopupHeader>
        <PopupBody>
          <div className="product-images">
            <h3>Product Images</h3>
            <ProductImagesWrapper>
              <ImagesContainer>
                {product?.productDetails?.images && product?.productDetails?.images.map((img, index) => (
                  <ImageWrapper key={index}>
                    <img
                      src={img}
                      alt={`${product?.productDetails?.name} preview ${index + 1}`}
                    />
                    <RemoveButton
                      onClick={() => removeImage(product.productId, index)}
                      aria-label="Remove image"
                    >
                      &times;
                    </RemoveButton>
                  </ImageWrapper>
                ))}
              </ImagesContainer>
            </ProductImagesWrapper>
          </div>
          <div className="product-info">
            <div className="info-item">
              <h3>Tagline</h3>
              <p>{product?.productDetails?.tagline}</p>
            </div>
            <div className="info-item">
              <h3>Catpion</h3>
              <p>{product?.productDetails?.caption}</p>
            </div>
            <div className="info-item">
              <h3>Download Link</h3>
              <p><a href={product?.productDetails?.download}>{product?.productDetails?.download}</a></p>
            </div>
            <div className="info-item">
              <h3>Category</h3>
              <p>{product?.productDetails?.category}</p>
            </div>
            <div className="info-item">
              <h3>Tags</h3>
              <div>
                {product?.productDetails?.tags?.map((tag, index) => (
                  <div key={index}>
                    <span style={{
                      fontSize: '1.2rem'
                    }}>{index + 1} - {tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="info-item">
              <h3>Description</h3>
              <ReactMarkdown>{product?.productDetails?.description}</ReactMarkdown>
            </div>
            <div className="info-item">
              <h3>Pricing</h3>
              <p><strong>Personal License:</strong> £{product.licenses.personal}</p>
              <p><strong>Commercial License:</strong> £{product.licenses.commercial}</p>
            </div>
          </div>

          {(product.bundlesPersonal && product.bundlesPersonal.length > 0) && (
            <div className="bundles-section">
              <h3>Personal Bundles</h3>
              <div className="bundles-grid">
                {product.bundlesPersonal.map(bundle => (
                  <div className="bundle-card" key={bundle.id}>
                    <div className="bundle-image">
                      <img src={bundle.image} alt={bundle.name} />
                    </div>
                    <i className='fa fa-trash' onClick={() => {
                      removeBundle(product?.productId, bundle?.id, 'personal');
                    }}></i>
                    <div className="bundle-info">
                      <h4>{bundle.name}</h4>
                      <p className="price">£{bundle.price}</p>
                      <ReactMarkdown>{bundle.description}</ReactMarkdown>
                    </div>
                    <p className='download'><a href={bundle.download}>{bundle.download}</a></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(product.bundlesCommercial && product.bundlesCommercial.length > 0) && (
            <div className="bundles-section">
              <h3>Commercial Bundles</h3>
              <div className="bundles-grid">
                {product.bundlesCommercial.map(bundle => (
                  <div className="bundle-card" key={bundle.id}>
                    <div className="bundle-image">
                      <img src={bundle.image} alt={bundle.name} />
                    </div>
                    <i className='fa fa-trash' onClick={() => {
                      removeBundle(product?.productId, bundle?.id, 'commercial');
                    }}></i>
                    <div className="bundle-info">
                      <h4>{bundle.name}</h4>
                      <p className="price">£{bundle.price}</p>
                      <ReactMarkdown>{bundle.description}</ReactMarkdown>
                    </div>
                    <p className='download'><a href={bundle.download}>{bundle.download}</a></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </PopupBody>
      </PopupContent>
    </PopupOverlay>
  );
};

const FormPopup = ({ title, children, setShowAddForm, setShowEditForm, setShowImageUploadForm, setShowBundleForm }) => {

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowAddForm(false);
      setShowEditForm(false);
      setShowImageUploadForm(false);
      setShowBundleForm(false);
    }
  };

  return (
    <PopupOverlay onClick={handleOverlayClick}>
      <FormPopupContent>
        <PopupHeader>
          <h2>{title}</h2>
        </PopupHeader>
        <PopupBody>
          {children}
        </PopupBody>
      </FormPopupContent>
    </PopupOverlay>
  );
};

// Styled Components
const Wrapper = styled.section`
  width: 80%;
  height: 100vh;

  hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .main {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 600;
    padding: 10px 0px;
  }

  .head {
    display: flex;
    flex-direction: row;
    padding: 1rem;
    justify-content: space-between;
    align-items: center;

    .cards {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      flex-wrap: wrap;

      .card {
        width: 20rem;
        height: fit-content;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
        background-color: #fffdfd;
        border-radius: 1rem;
        color: #000;
        box-shadow: 3px 2px 5px 2px gainsboro;
        
        h3 {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        span {
          font-size: 2rem;
          font-weight: bold;
        }
      }
    }

    .actions {
      .addBtn {
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #45a049;
        }
      }
    }
  }

  .table {
    padding: 1rem;

     .pagination {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    align-items: center;

    button {
      margin-left: 10px;
      padding: 5px 10px;
      cursor: pointer;
      border: none;
      color: rgb(67, 76, 230);
      font-weight: bold;
    }

    span {
      margin: 0 10px;
      font-size: 1.4rem;
    }
  }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #fefefe;
    }

    th, td {
      padding: 8px;
      text-align: left;
      font-size: 1.5rem;

      .removeBtn {
        border: none;
        color: #fff;
        background-color: red;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 2px;
        cursor: pointer;
      }

      .detailsBtn {
        border: none;
        color: #fff;
        background-color: green;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 2px;
        cursor: pointer;
      }

      .toggleVisibleBtn {
        border: none;
        color: #fff;
        background-color: blue;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 2px;
        cursor: pointer;
      }

      .add-img, .add-bundle {
    padding: 0 5px;
    margin: 1rem;
    border-radius: 5px;
    outline: none;
    border: none;
    cursor: pointer;
    i {
      font-size: 1.3rem;
    }
  }
    }

    th {
      background-color: #f2f2f2;
    }
  }

  .error {
    font-size: 1.2rem;
    color: red;
  }

  .success {
    font-size: 1.2rem;
    color: green;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormPopupContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const PopupHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 1.8rem;
  }
  
  button {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    line-height: 1;
  }
`;

const PopupBody = styled.div`
  padding: 20px;
  
  .product-images {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    
    .images-container {
      display: flex;
    }

    img {
      width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 5px;
    }
  }
  
  .product-info {
    .info-item {
      margin-bottom: 20px;
      
      h3 {
        margin-bottom: 10px;
        font-size: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
        font-weight: bold;
      }
    }
  }
  
  .bundles-section {
    margin-top: 30px;
    
    h3 {
      font-size: 2rem;
      margin-bottom: 15px;
    }
    
    .bundles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    
    .bundle-card {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      transition: box-shadow 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .fa-trash {
        position: absolute;
        top: 12px;
        right: 12px;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 10;
        color: #ff4d4f;
        font-size: 16px;
        
        &:hover {
          background-color: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
      }

      .download {
        padding-left: 15px;
        padding-top: 5px;
        padding-bottom: 5px;
        margin-bottom: 0;
        font-size: 0.9rem;
        word-break: break-all;
        
        a {
          color: #434ce6;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
      
      .bundle-image {
        height: 150px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .bundle-info {
        padding: 15px;
        
        h4 {
          margin-top: 0;
          font-size: 2.3rem;
          margin-bottom: 8px;
        }
        
        .price {
          font-weight: bold;
          color: #434ce6;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
      }
    }
  }
  }

  .form-group {
    margin-bottom: 15px;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      text-transform: unset;
    }

    .image-source-options {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-top: 1rem;

      input {
        outline: none;
        border: none;
        box-shadow: none;
      }
    }
  }

  .tag-btn {
    padding: 0 5px;
    margin: 1rem;
    border-radius: 5px;
    outline: none;
    border: none;
    cursor: pointer;
    i {
      font-size: 1.3rem;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    
    button {
      padding: 8px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .saveBtn {
      background-color: #434ce6;
      color: white;
      font-size: 1.2rem;
    }
    
    .cancelBtn {
      background-color: #f2f2f2;
      color: #333;
      font-size: 1.2rem;
    }
  }
`;

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  
  .tag {
    display: flex;
    align-items: center;
    background-color: #f3f4f6;
    border-radius: 6px;
    padding: 4px 8px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #e5e7eb;
    }
    
    span {
      font-size: 0.875rem;
      color: #374151;
      margin-right: 6px;
    }
    
    button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        color: #ef4444;
        background-color: rgba(239, 68, 68, 0.1);
      }
    }
  }
`;

const ProductImagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    button {
      opacity: 1;
    }
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4f;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
`;


export default Products;