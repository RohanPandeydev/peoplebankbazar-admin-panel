import { Route } from "react-router";
import Dashboard from "../../pages/Dashboard";
import Login from "../../pages/Login";
import SampleForm from "../../pages/SampleForm";
import SampleGrid from "../../pages/SampleGrid";
import RequireAuth from "../../guard/RoutesGuard";
import Blog from "../../pages/Blog";
import BlogDetails from "../../pages/BlogDetails";
import AddBlog from "../../pages/AddBlog";
import UpdateBlog from "../../pages/UpdateBlog";
import Category from "../../pages/Category";
import AddCategory from "../../pages/AddCategory";
import Bank from "../../pages/Bank";
import AddBank from "../../pages/AddBank";
import HomeCms from "../../pages/HomeCms";
import CategoryCms from "../../pages/CategoryCms";
import BankCms from "../../pages/BankCms";
import Promotional from "../../pages/Promotional";
import AlsoBuy from "../../pages/AlsoBuy";
import AddPromotional from "../../pages/AddPromotional";
import AddAlsoBuy from "../../pages/AddAlsoBuy";
import AddCms from "../../pages/AddCms";


const RoutesPath = () => {
    return (
        <>
            {/* Dashboard */}
            <Route
                path="/"
                element={
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth>
                }
            />
            <Route path="/login" element={<Login />} />



            {/* Master */}
            <Route
                path="/master/categories"
                element={
                    <RequireAuth >
                        <Category />
                    </RequireAuth>
                }
            />
            <Route
                path="/master/categories/add"
                element={
                    <RequireAuth >
                        <AddCategory />
                    </RequireAuth>
                }
            />
            <Route
                path="/master/banks"
                element={
                    <RequireAuth >
                        <Bank />
                    </RequireAuth>
                }
            />
            <Route
                path="/master/banks/add"
                element={
                    <RequireAuth >
                        <AddBank />
                    </RequireAuth>
                }
            />

            {/* CMS */}
            <Route
                path="/cms/homepage"
                element={
                    <RequireAuth >
                        <HomeCms />
                    </RequireAuth>
                }
            />
            <Route
                path="/cms/category-listing"
                element={
                    <RequireAuth >
                        <CategoryCms />
                    </RequireAuth>
                }
            />
            <Route
                path="/cms/category/add"
                element={
                    <RequireAuth >
                        <AddCms />
                    </RequireAuth>
                }
            />
            <Route
                path="/cms/bank-details"
                element={
                    <RequireAuth >
                        <BankCms />
                    </RequireAuth>
                }
            />
            <Route
                path="/cms/bank-details/add"
                element={
                    <RequireAuth >
                        <AddCms />
                    </RequireAuth>
                }
            />
            <Route
                path="/cms/category-listing/add"
                element={
                    <RequireAuth >
                        <AddCms />
                    </RequireAuth>
                }
            />


            {/* Promotions */}
            <Route
                path="/promotions/cards"
                element={
                    <RequireAuth >
                        <Promotional />
                    </RequireAuth>
                }
            />
            <Route
                path="/promotions/cards/add"
                element={
                    <RequireAuth >
                        <AddPromotional />
                    </RequireAuth>
                }
            />

            <Route
                path="/promotions/also-buy"
                element={
                    <RequireAuth >
                        <AlsoBuy />
                    </RequireAuth>
                }
            />
            <Route
                path="/promotions/also-buy/add"
                element={
                    <RequireAuth >
                        <AddAlsoBuy />
                    </RequireAuth>
                }
            />
            {/* Samples */}
            <Route path="/sample/form" element={<SampleForm />} />
            <Route path="/sample/grid" element={<SampleGrid />} />
        </>
    );
};

export default RoutesPath;
