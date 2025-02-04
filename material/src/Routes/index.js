import React from "react";
import { Routes, Route } from "react-router-dom";

// Routes
import { authProtectedRoutes, publicRoutes } from "./allRoutes";
import { AuthProtected } from "./AuthProtected";
import Navbar from "./Navbar";

const Index = () => {
    return (
        <React.Fragment>
            
            {/* <Navbar/> */}
            
            <Routes>
               
                {/* Public Routes */}
                {publicRoutes.map((route, idx) => (
                    <Route
                        path={route.path}
                        element={route.component}
                        key={idx}
                        exact={true}
                    />
                ))}

                {/* Authenticated Routes */}
                {/* {authProtectedRoutes.map((route, idx) => (
                    <Route
                        path={route.path}
                        element={
                            <AuthProtected>
                                {route.component}
                            </AuthProtected>
                        }
                        key={idx}
                        exact={true}
                    />
                ))} */}
            </Routes>
        </React.Fragment>
    );
};

export default Index;
