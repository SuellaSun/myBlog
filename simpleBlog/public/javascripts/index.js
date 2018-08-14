var app = angular.module('myApp', ['ngRoute']);

// 路由控制
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'blogListCtrl',
            templateUrl: '../views/blog-list.html'
        })
        .when('/login', {
            controller: 'loginCrtl',
            templateUrl: '../views/login.html'
        })
        .when('/signup', {
            controller: 'signupCrtl',
            templateUrl: '../views/signup.html'
        })
        .when('/bloglist', {
            controller: 'blogListCtrl',
            templateUrl: '../views/blog-list.html'
        })
        .when('/personalhome', {
            controller: 'personalCtrl',
            templateUrl: '../views/personal-homepage.html'
        })
        .when('/getArticleDetails/:articleInfo', {
            controller: 'articleDetailCtrl',
            templateUrl: '../views/blog-item.html'
        })
        .when('/writeblog', {
            controller: 'writeBlogCtrl',
            templateUrl: '../views/write-blog.html'
        })
        .otherwise({
            redirectTo: '/'
        });

}]);

// 主页控制器
app.controller("homeCtrl", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    // 一些标记，记录状态
    $rootScope.isLogout = true;
    $rootScope.isLogin = false;
    $rootScope.isMyblog = false;

    // 点击登陆按钮登陆
    $scope.login = function () {
        $location.path('/login').replace();
    }

    // 注册按钮 
    $scope.signup = function () {
        $location.path('/signup').replace();
    }

    // 退出按钮
    $scope.logout = function () {
        alert('确定退出');
        $rootScope.isLogout = true;
        $rootScope.isLogin = false;
        $location.path('/').replace();

    }
}]);

// 登录页控制器
app.controller("loginCrtl", ['$scope', '$rootScope', '$http', '$location', function ($scope, $rootScope, $http, $location) {
    $scope.dataSumbit = function () {
        if ($scope.myForm.$valid) { // 表单验证成功
            $http({
                method: 'post',
                url: '/login',
                data: $scope.user
            }).success(function (data, status, header, cfg) {
                if (data.status == 200) { // 验证成功

                    $rootScope.isLogout = false;
                    $rootScope.isLogin = true;
                    $rootScope.user = $scope.user;

                    $location.path('/').replace();
                }
                else if (data.status == 401.1) { // 验证失败

                    alert('用户名或密码错误！请重新输入');
                    $location.path('/login').replace();
                }
            }).error(function (data, status, header, cfg) {
                alert(status);
            });
        }
    }
}]);

// 注册页控制器（待实现。。。）
app.controller("signupCrtl", ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.signUserInfo = {
        "username": "",
        "password": "",
        "confirmPassword": ""
    }
    $scope.dataSumbit = function () {
        if ($scope.myForm.$valid) { // 表单验证成功
            $http({
                method: 'post',
                url: '/signup',
                data: { "username": $scope.signUserInfo.username, "password": $scope.signUserInfo.password }
            }).success(function (data, status, header, cfg) {
                if (data.status == 200) { // 注册成功
                    alert('注册成功');
                    $location.path('/login').replace();
                }
                else if (data.status == 403.3) { // 注册失败

                    alert('注册失败');
                    $location.path('/signup').replace();
                }
            }).error(function (data, status, header, cfg) {
                alert(status);
            });
        }
    }
}]);

// 首页控制器
app.controller('blogListCtrl', ['$scope', '$rootScope', '$http', '$location', '$filter', function ($scope, $rootScope, $http, $location, $filter) {
    $rootScope.isMyblog = false;
    $http({// 与后端交互，获取数据
        method: 'GET',
        url: '/getBlogList'
    }).success(function (data, status, header, cfg) {
        $scope.blogItems = data;
        if ($scope.blogItems.length === 0)
            $scope.isNull = true;
        else {
            $scope.isNull = false;
            for (var i = 0; i < $scope.blogItems.length; i++) {
                // 简单处理：显示博客部分内容 ，日期进行格式化
                $scope.blogItems[i].content = $scope.blogItems[i].content.slice(0, 10) + "...";
                $scope.blogItems[i].date = $filter('date')($scope.blogItems[i].date, "yyyy-MM-dd hh:mm:ss");
            }
        }
    }).error(function (data, status, header, cfg) {
        alert(status);
    });

    //与个人主页页面逻辑相同
    $scope.blogClickHandler = function (index) {
        if ($rootScope.isLogin && !$rootScope.isLogout) {
            $scope.user = $rootScope.user;
            $rootScope.isMyblog = true;

            var articleInfo = $scope.blogItems[index].id + '|' + $scope.blogItems[index].username;
            $location.path('/getArticleDetails/' + articleInfo);
        }
        else {
            alert('您还未登录，请先登录');
            $location.path('/login').replace();
        }
    }

    $scope.changeOver = function (index) {
        $scope.over = index;
    }
}]);

// 个人主页控制器
app.controller('personalCtrl', ['$scope', '$rootScope', '$http', '$location', '$filter', function ($scope, $rootScope, $http, $location, $filter) {
    if ($rootScope.isLogin && !$rootScope.isLogout) {
        $scope.user = $rootScope.user;
        $rootScope.isMyblog = true;

        $http({// 与后端交互，获取数据
            method: 'post',
            url: '/getPersonalhome',
            data: $scope.user
        }).success(function (data, status, header, cfg) {
            $scope.blogItems = data;
            if ($scope.blogItems.length == 0)
                $scope.isNull = true;
            else {
                $scope.isNull = false;
                for (var i = 0; i < $scope.blogItems.length; i++) {
                    // 简单处理：显示博客部分内容 ，日期进行格式化
                    $scope.blogItems[i].content = $scope.blogItems[i].content.slice(0, 10) + "...";
                    $scope.blogItems[i].date = $filter('date')($scope.blogItems[i].date, "yyyy-MM-dd hh:mm:ss");
                }
            }

        }).error(function (data, status, header, cfg) {
            alert(status);
        });

        $scope.blogClickHandler = function (index) {
            var articleInfo = $scope.blogItems[index].id + '|' + $scope.blogItems[index].username;
            $location.path('/getArticleDetails/' + articleInfo);
        }

        $scope.changeOver = function (index) {
            $scope.over = index;
        }

        $scope.btnWtieBlogs = function () {
            $location.path('/writeblog').replace();
        }
    } else {
        alert('您还未登录，请先登录');
        $location.path('/login').replace();
    }
}]);

// 博客详情页
app.controller('articleDetailCtrl', ['$scope', '$routeParams', '$http', '$filter', function ($scope, $routeParams, $http, $filter) {
    $scope.articleInfo = $routeParams.articleInfo;
    var info = $scope.articleInfo.split('|');

    $scope.postData = {
        "id": info[0],
        "username": info[1]
    }

    $http({// 与后端交互，获取数据
        method: 'post',
        url: '/getArticleDetails',
        data: $scope.postData
    }).success(function (data, status, header, cfg) {
        $scope.article = data;
        $scope.article.date = $filter('date')($scope.article.date, "yyyy-MM-dd hh:mm:ss");
    }).error(function (data, status, header, cfg) {
        alert(status);
    });

}]);

// 写博客页面
app.controller('writeBlogCtrl', ['$scope', '$rootScope', '$http', '$location', '$interval', function ($scope, $rootScope, $http, $location, $interval) {
    if ($rootScope.isLogin && !$rootScope.isLogout) {

        $rootScope.isMyblog = true;
        $scope.user = $rootScope.user;

        // 需要初始化，不然在第一次提交时，若博客标题或者内容为空，会出现title未定义的错误
        $scope.blog = {
            "title": "",
            "content": "",
            "date": ""
        }

        $scope.blog.date = Date.parse(new Date());
        $interval(function () {
            $scope.blog.date = Date.parse(new Date());
        }, 1000);

        $scope.blogPublish = function () {
            if ($scope.blog.title !== "" && $scope.blog.content !== "") {
                $http({
                    method: 'post',
                    url: '/postBlogs',
                    data: { user: $scope.user, blog: $scope.blog }
                }).success(function (data, status, header, cfg) {
                    if (data.status === 200) {
                        alert('提交成功');
                        $location.path('/writeblog').replace();
                    }
                    else if (data.status === 403.3) {
                        alert('提交失败');
                        $location.path('/writeblog').replace();
                    }
                }).error(function (data, status, header, cfg) {
                    alert(status);
                });
            }
            else {
                alert("博客标题或者内容不能为空");
            }
        }
        $scope.blogListReview = function () {
            $location.path('/personalhome').replace();
        }
    }
    else {
        alert('您还未登录，请先登录');
        $location.path('/login').replace();
    }
}]);

// 自定义验证用户名的指令
app.directive("usernameValidate", function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {

            var uNameRegexp = /^(?![0-9]+$)[a-zA-Z_][a-zA-Z_0-9]{8,20}$/; // 不能以数字开头，可包含数字字母下划线，长度6-20位
            var phoneRegexp = /^1[3|5|8][0-9]\d{4,8}$/; // 11位手机号
            var emailRegexp = /^([a-z0-9]*[-_.]?[a-z0-9]+)+@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/;
            var isPhone = /^\d{11,11}$/; // 11位的纯数字
            var isEmail = /[\@]/; // 包含@

            // 正则验证
            ctrl.$parsers.unshift(function (viewValue) {
                if (isPhone.test(viewValue)) {//纯数字
                    if (phoneRegexp.test(viewValue))
                        ctrl.$setValidity('formatValid', true);
                    else
                        ctrl.$setValidity('formatValid', false);
                } else if (isEmail.test(viewValue)) {
                    if (emailRegexp.test(viewValue))
                        ctrl.$setValidity('formatValid', true);
                    else
                        ctrl.$setValidity('formatValid', false);
                } else {
                    if (uNameRegexp.test(viewValue))
                        ctrl.$setValidity('formatValid', true);
                    else
                        ctrl.$setValidity('formatValid', false);
                }
                return viewValue;
            });
            ctrl.$render = function () { };
        }
    }
});
// 自定义用户名唯一性验证指令
app.directive("usernameUnique", function ($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(attrs.ngModel, function (viewValue) {
                $http({
                    method: 'post',
                    url: '/uniqueValidate',
                    data: { "username": viewValue }
                }).success(function (data, status, header, cfg) {
                    ctrl.$setValidity('unique', data.isUnique);
                }).error(function (data, status, header, cfg) {
                    ctrl.$setValidity('unique', false);
                });

            });
        }
    }
});

// 自定义密码一致性验证指令
app.directive("passwordRepeat", function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.passwordRepeat];
            ctrl.$parsers.push(function (value) {
                if (value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });
            otherInput.$parsers.push(function (value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;

            });
        }
    }
});
