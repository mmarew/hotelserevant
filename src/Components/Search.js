import React, { useEffect, useState } from "react";
import { ConsumeContext } from "./ContextProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";

function Search() {
  const Navigate = useNavigate();
  const path = process.env.REACT_APP_PATH;
  const [{ searchQuery, token }, SETORDER] = ConsumeContext();
  const [searchedValues, setSearchedValues] = useState(["wait..."]);

  const getBusiness = async () => {
    try {
      const response = await axios.get(path + "/searchBusiness", {
        headers: {
          Authorization: token,
          searchQuery,
        },
      });
      console.log(response.data.data);
      setSearchedValues(response.data.data);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    if (searchQuery !== "") {
      getBusiness();
    } else {
      setSearchedValues([]);
    }
  }, [searchQuery]);

  return (
    <div>
      <br />
      <br />
      <br />
      <h1>Search Results</h1>
      {searchedValues[0] === "wait..." ? (
        searchedValues[0]
      ) : searchedValues.length === 0 ? (
        <h5>No results found</h5>
      ) : (
        <Grid container spacing={2}>
          {searchedValues.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                onClick={() => Navigate("/business/" + item.BusinessName)}
                sx={{ cursor: "pointer" }}
              >
                <CardContent>
                  <BusinessIcon />
                  <Typography component="div">{item?.usersFullName}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  ></Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default Search;
