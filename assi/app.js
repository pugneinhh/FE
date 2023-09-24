// import data from "./db.json" assert { type: "json" };

var app = angular.module("myApp", ["ngRoute", "ngSanitize"]);
//bước 1: import angular-route
//bước 2: khai báo router
//bước 3: khai báo <ng-view></ng-view>
app.filter("unsafe", function ($sce) {
  return $sce.trustAsHtml;
});
app.config(function ($routeProvider, $locationProvider) {
  $locationProvider.hashPrefix("");
  $routeProvider
    .when("/", {
      templateUrl: "./pages/list-product.html",
      controller: "myController",
    })
    .when("/chitietsp/:id", {
      templateUrl: "./pages/chitietsp.html",
      controller: "productController",
    })
    .when('/admin', {
      templateUrl: "./pages/dashboard.html",
      controller: "dashboardController"
  })
  .when('/suaSP/:idsp', {
    templateUrl: "./pages/suaSP.html",
    controller: "dashboardController"
  })
  .when('/themSP', {
    templateUrl: "./pages/themSP.html",
    controller: "dashboardController"
  })
  .when('/giohang', {
    templateUrl: "./pages/giohang.html",
    controller: "cartController"
  })
  // .when('/giaThap',{
  //   templateUrl: "./pages/list-product.html",
  //     controller: "myController",
  // })
  // .when('/giaCao',{
  //   templateUrl: "./pages/list-product.html",
  //     controller: "myController",
  // })
    .otherwise({
      redirecTo: "/",
    });
});
app.controller("cartController",function($scope, $http,$location){

  $http.get('http://localhost:3000/cart')
 .then(function (res) {
      $scope.cart = res.data
      $scope.tt=0;
      for(var i=0; i<$scope.cart.length;i++){
        $scope.tt+=$scope.cart[i].thanhtien
      }
  })
  
  $scope.updateSL=function(item){
    item.thanhtien=item.gia*item.soluong
    $http.put('http://localhost:3000/cart/'+item.id,{ten:item.ten,gia:item.gia,soluong:item.soluong,anh:item.anh,thanhtien:item.thanhtien})   
  }

  $scope.deleteSP = function (id) {
    console.log(id);
    $http.delete('http://localhost:3000/cart/' + id)
      .then(function () {
        alert("Xoá thành công")
      })
  }
  $scope.muaTiep=function () {
  $location.url("/")
  }
});
app.controller("productController", function ($scope,$rootScope, $routeParams,$http) {
  $scope.id = $routeParams.id;
  
  $http.get('http://localhost:3000/books/'+$scope.id)
  .then(function (res) {
      $scope.product = res.data
      $scope.thayanh=$scope.product.images[0];
  })
  $http.get('http://localhost:3000/cart')
  .then(function (res) {
       $scope.cart = res.data
       $rootScope.slgh=0
       for (var i = 0; i < $scope.cart.length; i++){
        $rootScope.slgh=Number($rootScope.slgh)+Number($scope.cart[i].soluong);
        console.log(Number($rootScope.slgh))
        console.log(Number($scope.cart[i].soluong))
       }
   })
   
   
  $scope.layAnh=function(stt){
    $scope.thayanh=$scope.product.images[stt];
  }
  //thêm sp vào giỏ hàng
  $scope.addGH=function(sp){
  $scope.ten=sp.name;
  $scope.gia=sp.original_price;
  $scope.soluong=$scope.quantity;
  $scope.thanhtien=$scope.gia*$scope.soluong;
  $scope.anh=sp.images[0];
  $http.get('http://localhost:3000/cart')
  .then(function (res) {
       $scope.cart = res.data;
       console.log($scope.cart);
       
       for (var i = 0; i <$scope.cart.length; i++) {
         $rootScope.slgh+=$scope.cart[i].soluong
        if ($scope.cart[i].ten == sp.name) {
          $scope.check=1;
          console.log($scope.check)
          $http.put('http://localhost:3000/cart/'+$scope.cart[i].id,{
            ten:$scope.ten,
            gia:$scope.gia,
            soluong:$scope.soluong+$scope.cart[i].soluong,
            anh:$scope.anh,
            thanhtien:($scope.soluong+$scope.cart[i].soluong)*$scope.gia
          })
              .then(function(){
                alert("Thêm vào giỏ hàng thành công")
                
              })
        }
      }
      if($scope.check==undefined){
        $http.post('http://localhost:3000/cart',{
         ten:$scope.ten,
         gia:$scope.gia,
         soluong:$scope.soluong,
         anh:$scope.anh,
         thanhtien:$scope.thanhtien})
           .then(function(){
             alert("Thêm vào giỏ hàng thành công")
           })
       
         }
   })
   
  }
  
});
app.controller('dashboardController', function ($scope,$routeParams, $http,$location) {

  $scope.id = $routeParams.idsp;
  $http.get('http://localhost:3000/books/'+$scope.id)
  .then(function (res) {
      $scope.product = res.data
      $scope.tenSP=$scope.product.name
      $scope.anhSP=$scope.product.images[0]
      $scope.moTaSP=$scope.product.short_description
      $scope.gia=$scope.product.original_price
  })

  $scope.addSP = function () {
    $scope.product.images=[ $scope.images]
    var chuoianh=$scope.images.split(",");
    console.log(chuoianh.length);
    console.log("ảnh 1"+chuoianh[0]);
    console.log("ảnh 2"+chuoianh[1]);
    if(chuoianh.length==1){
      $scope.product.images[0]=chuoianh[0]
    }
    if(chuoianh.length==2){
      $scope.product.images[0]=chuoianh[0];
      $scope.product.images[1]=chuoianh[1]
    }
    if(chuoianh.length==3){
      $scope.product.images[0]=chuoianh[0];
      $scope.product.images[1]=chuoianh[1];
      $scope.product.images[2]=chuoianh[2]
    }
    $scope.product.rating_average=0
    $scope.product.short_description=$scope.product.description.substring(0,200)+"..."
    $http.post('http://localhost:3000/books',$scope.product)
      .then(function () {
        alert("Thêm thành công")
        $location.url("/admin")
      })
  }
  $scope.capNhat = function () {
    
    // var chuoianh=$scope.product.images.split(",");
    // console.log(chuoianh)
    // if(chuoianh.length==2){
    //   $scope.product.images[0]=chuoianh[0];
    //   $scope.product.images[1]=chuoianh[1]
    // }
    // if(chuoianh.length==3){
    //   $scope.product.images[0]=chuoianh[0];
    //   $scope.product.images[1]=chuoianh[1];
    //   $scope.product.images[2]=chuoianh[2]
    // }
    $http.put('http://localhost:3000/books/' + $scope.id, $scope.product)
      .then(function () {
        alert("Update thành công")
        $location.url("/admin")
      })
  }
$scope.huy = function () {
  $location.url("/admin")
}
$scope.delete = function (id) {
  console.log(id);
  $http.delete('http://localhost:3000/books/' + id)
    .then(function () {
      alert("Xoá thành công")
    })
}
$scope.thayGia = function (gia) {
  if (gia < 0) {
    $scope.gia = 0;
  }
}
})
app.controller("myController", function ($rootScope,$scope,$http) {
  $rootScope.books=[]
  $http.get('http://localhost:3000/books')
  .then(function (res) {
      $rootScope.books = res.data
  }) 
  $http.get('http://localhost:3000/cart')
  .then(function (res) {
       $scope.cart = res.data
       $rootScope.slgh=0;
       for (var i = 0; i < $scope.cart.length; i++){
        $rootScope.slgh=Number($rootScope.slgh)+Number($scope.cart[i].soluong);
        console.log(Number($rootScope.slgh))
        console.log(Number($scope.cart[i].soluong))
       }
   })
  $scope.renderRating = function (star) {
    let index = 0;
    if (star == 0) index = -1;
    if (star > 0) index = 0;

    $scope.rating = "";
    for (index; index < parseInt(star); index++) {
      if (star == 0) {
        return ($scope.rating = `
                             <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
                             <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
                             <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
                             <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
                             <i class="fas fa-star" style="color: #d1d1d1;"></i>
                             `);
      }
      if (star == 5) {
        return ($scope.rating = `<i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star "></i>&nbsp;`);
      }
      if (star < 5) {
        return ($scope.rating = `<i class="fas fa-star" ></i>&nbsp;
            <i class="fas fa-star" ></i>&nbsp;
            <i class="fas fa-star" ></i>&nbsp;
            <i class="fas fa-star" ></i>&nbsp;
            <i class="fas fa-star " style="color: #d1d1d1;"></i>&nbsp;`);
      }
      if (star < 4) {
        return ($scope.rating = `<i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
               <i class="fas fa-star " style="color: #d1d1d1;"></i>&nbsp;`);
      }
      if (star < 3) {
        return ($scope.rating = `<i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
               <i class="fas fa-star " style="color: #d1d1d1;"></i>&nbsp;`);
      }
      if (star < 2) {
        return ($scope.rating = `<i class="fas fa-star" ></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;" ></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
               <i class="fas fa-star" style="color: #d1d1d1;"></i>&nbsp;
               <i class="fas fa-star " style="color: #d1d1d1;"></i>&nbsp;`);
      }
    }
    return $scope.rating;
  };
  $scope.quantity = 1;
  $scope.down = function () {
    $scope.quantity--;
    if ($scope.quantity < 0) {
      $scope.quantity = 0;
    }
  };
  $scope.up = function () {
    $scope.quantity++;
  };
  // get all Pro
  $scope.getAll = function () {
    $http.get('http://localhost:3000/books')
  .then(function (res) {
      $rootScope.books = res.data
  }) 
  };
  // tìm kiếm sản phẩm
  $scope.searchPro = function (ten) {
    
    var list = [];
    $http.get('http://localhost:3000/books')
  .then(function (res) {
      $rootScope.data = res.data
  }) 
    for (var i = 0; i <  $rootScope.data.length; i++) {
      // var str=$scope.data[i].name.normalize('NFD')
      // .replace(/[\u0300-\u036f]/g, '')
      // .replace(/đ/g, 'd').replace(/Đ/g, 'D');

      var sp = $rootScope.data[i].name.toLowerCase();
      
      if (sp.includes(ten.toLowerCase())) {
        list.push($rootScope.data[i]);
        
      }
      
    }
    $rootScope.books = list;
    
  };
  // lọc giá từ thấp -> cao
  $scope.giaTangDan = function () {
    $http.get('http://localhost:3000/books')
      .then(function (res) {
        $rootScope.books = res.data
        $rootScope.books.sort(function (a, b) {
          return a.original_price - b.original_price;
        });
      })


  };
  $scope.banChay = function () {
    $http.get('http://localhost:3000/books')
    .then(function (res) {
        $rootScope.data = res.data
    }) 

    var list = [];
    for (var i = 0; i < $rootScope.data.length; i++) {
      if ($rootScope.data[i].rating_average != 0) {
        list.push($rootScope.data[i]);

      }
    }

    $rootScope.books = list.sort(function (a, b) {
      return b.rating_average - a.rating_average;
    });


  };
  $scope.spMoi = function () {
    $http.get('http://localhost:3000/books')
    .then(function (res) {
        $rootScope.data = res.data
    }) 
    var list = [];
    for (var i = 0; i < $rootScope.data.length; i++) {
      if ($rootScope.data[i].rating_average == 0)
        list.push($rootScope.data[i]);
    }
    $rootScope.books = list;
  };

  // lọc giá từ cao -> thấp
  $scope.giaGiamDan = function () {
    $http.get('http://localhost:3000/books')
      .then(function (res) {
        $rootScope.books = res.data
        $rootScope.books.sort(function (a, b) {
          return b.original_price - a.original_price;
        });
      })
  };
});
