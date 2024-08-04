"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import {
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import EditProductModal from './modal';

export default function LabTabs() {
  const [value, setValue] = React.useState("1");
  const [products, setProducts] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  React.useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ ...doc.data(), id: doc.id });
      });
      setProducts(productsArray);
      setFilteredProducts(productsArray);
    });

    return () => unsubscribe();
  }, []);

  const formik = useFormik({
    initialValues: {
      product: "",
      number: "",
    },
    onSubmit: async (values) => {
      try {
        const docRef = await addDoc(collection(db, "products"), values);
        console.log("Document written with ID: ", docRef.id);
        formik.resetForm();
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    },
  });

  const handleDelete = async (productId) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      console.log("Document deleted with ID: ", productId);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenEditModal(true);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = products.filter((product) =>
      product.product.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSelectChange = (event, product) => {
    const action = event.target.value;
    if (action === "edit") {
      handleEdit(product);
    } else if (action === "delete") {
      handleDelete(product.id);
    }
  };

  const handleEditSubmit = async (updatedProduct) => {
    try {
      const productDoc = doc(db, "products", updatedProduct.id); // Reference to the document
      await updateDoc(productDoc, { // Update only specific fields
        product: updatedProduct.product,
        number: updatedProduct.number
      });
      console.log("Document updated with ID: ", updatedProduct.id);
      setOpenEditModal(false); // Close the modal after successful update
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <main className="flex flex-col p-2 justify-center items-center">
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Form" value="1" />
            <Tab label="Items List" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {/* Form for adding new items */}
          <form
            className="flex flex-row justify-center items-center gap-1"
            onSubmit={formik.handleSubmit}
          >
            <TextField
              id="product"
              type="text"
              label="Product"
              value={formik.values.product}
              onChange={formik.handleChange}
              variant="outlined"
              size="small"
              required
            />
            <TextField
              id="number"
              type="text"
              label="Number"
              value={formik.values.number}
              onChange={formik.handleChange}
              variant="outlined"
              size="small"
              required
            />
            <Button type="submit" variant="contained">
              +
            </Button>
          </form>
          {/* Display the two most recently added products */}
          {products.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6">Recently Added Products</Typography>
              {products.slice(-2).map((product, index) => (
                <Box
                  key={product.id}
                  gap={12}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={index === 0 ? 2 : 1}
                >
                  <span>{product.product}</span>
                  <span>{product.number}</span>
                </Box>
              ))}
            </Box>
          )}
        </TabPanel>
        <TabPanel value="2">
          {/* List of items with search and delete functionality */}
          <Typography variant="h6">Products</Typography>
          <TextField
            id="search"
            type="text"
            label="Search Products"
            value={searchQuery}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            className="mb-4"
          />
          {filteredProducts.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.product}</TableCell>
                      <TableCell>{product.number}</TableCell>
                      <TableCell>
                        <Select
                          value=""
                          onChange={(event) => handleSelectChange(event, product)}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            
                          </MenuItem>
                          <MenuItem value="edit">Edit</MenuItem>
                          <MenuItem value="delete">Delete</MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box>No products available</Box>
          )}
        </TabPanel>
      </TabContext>
      <EditProductModal
        open={openEditModal}
        handleClose={() => setOpenEditModal(false)}
        product={selectedProduct}
        onSubmit={handleEditSubmit}
      />
    </main>
  );
}
