class ApiFeatures {
    constructor(mongooseQuery, queryData) {
      this.mongooseQuery = mongooseQuery;
      this.queryData = queryData;
    }
  
    paginate() {
      let { page, size } = this.queryData;
      if (!size || size <= 0) {
        size = 5;
      }
      if (!page || page <= 0) {
        page = 1;
      }
      this.mongooseQuery.limit(parseInt(size)).skip((parseInt(page) - 1) * parseInt(size));
      return this;
    }
  
    filter() {
      const excludedQueryParams = ['page', 'size', 'sort', 'search', 'fields'];
      const filterQuery = { ...this.queryData };
      excludedQueryParams.forEach((item) => delete filterQuery[item]);
      this.mongooseQuery.find(
        
      );
      return this;
    }
    sort() {
      this.mongooseQuery.sort(this.queryData.sort?.replaceAll(',', ' '));
      return this;
    }
  }
  
  export default ApiFeatures;
  