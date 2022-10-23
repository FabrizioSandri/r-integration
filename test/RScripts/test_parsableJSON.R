if (!require(jsonlite)) {
  install.packages('jsonlite', repos='http://cran.us.r-project.org')
  library(jsonlite)
}

json <- '[
  {"Name" : "Mario", "Age" : 32, "Occupation" : "Plumber"}, 
  {"Name" : "Peach", "Age" : 21, "Occupation" : "Princess"},
  {},
  {"Name" : "Bowser", "Occupation" : "Koopa"}
]'

mydf <- fromJSON(json)
result <- jsonlite::toJSON(mydf, dataframe = "r", pretty = F)

print(result)
