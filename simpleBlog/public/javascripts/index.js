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
            }).then(function (res) {
                if (res.data.status == 200) { // 验证成功

                    $rootScope.isLogout = false;
                    $rootScope.isLogin = true;
                    $rootScope.user = $scope.user;

                    $location.path('/').replace();
                }
                else if (res.data.status == 401.1) { // 验证失败

                    alert('用户名或密码错误！请重新输入');
                    $location.path('/login').replace();
                }
            });
        }
    }
}]);

// 注册页控制器
app.controller("signupCrtl", ['$scope', '$rootScope', '$http', '$location', function ($scope, $rootScope, $http, $location) {
    $scope.dataSumbit = function () {
        if ($scope.myForm.$valid) { // 表单验证成功
            $http({
                method: 'post',
                url: '/signup',
                data: $scope.userSign
            }).then(function (res) {
                if (res.data.status == 200) { // 注册成功

                    // $rootScope.isLogout = false;
                    // $rootScope.isLogin = true;
                    // $rootScope.user = $scope.user;
                    alert('注册成功');
                    $location.path('/login').replace();
                }
                else if (res.data.status == 403.3) { // 注册失败

                    alert('注册失败');
                    $location.path('/signup').replace();
                }
            });
       }
    }
}]);

// 首页控制器
app.controller('blogListCtrl', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    $rootScope.isMyblog = false;
    $http({// 与后端交互，获取数据
        method: 'GET',
        url: '/getBlogList'
    }).then(function (res) {
        if (res.status !== 200)
            alert(res.status + "状态，出错啦！");
        $scope.blogItems = res.data.blogitem;
    });

    // 利用事件委托实现事件绑定一次
    var myUL = document.getElementById("blogList");
    var myLI = myUL.getElementsByClassName("list-item");

    $scope.blogClickHandler = function ($event) {
        var event = $event || window.event;
        var target = event.target || event.srcElement;// 兼容IE和Firefox

        target = getParentByClassName(target, "list-item");
        if (target.classList.contains("list-item")) {
            for (var i = 0; i < myLI.length; i++) {
                if (myLI[i] === target) {
                    var children = target.children;
                    window.location.href = "../veiws/blog-item.html";
                    // alert(children[1].innerHTML);// 这里目前用的还是DOM
                }
            }
        }
    }

    $scope.changeOver = function ($event) {
        var event = $event || window.event;
        var target = event.target || event.srcElement;//兼容IE和Firefox

        target = getParentByClassName(target, "list-item");
        if (target.classList.contains("list-item")) {
            for (var i = 0; i < myLI.length; i++) {
                if (myLI[i] === target) {
                    target.style.backgroundColor = "WhiteSmoke";// 这里目前用的还是DOM
                }
            }
        }
    }
    $scope.changeOut = function ($event) {
        var event = $event || window.event;
        var target = event.target || event.srcElement;//兼容IE和Firefox

        target = getParentByClassName(target, "list-item");
        if (target.classList.contains("list-item")) {
            for (var i = 0; i < myLI.length; i++) {
                if (myLI[i] === target) {
                    target.style.backgroundColor = "";// 这里目前用的还是DOM
                }
            }
        }
    }
}]);

// 个人主页控制器
app.controller('personalCtrl', ['$scope', '$rootScope', '$http', '$location', function ($scope, $rootScope, $http, $location) {
    if ($rootScope.isLogin && !$rootScope.isLogout) {
        $scope.user = $rootScope.user;
        $rootScope.isMyblog = true;

        $http({// 与后端交互，获取数据
            method: 'GET',
            url: '/getPersonalhome'
        }).then(function (res) {
            if (res.status !== 200)
                alert(res.status + "状态，出错啦！");
            $scope.blogItems = res.data;
            if ($scope.blogItems === "")
                $scope.isNull = true;
            else
                $scope.isNull = false;
        });

        $scope.btnWtieBlogs = function () {
            $location.path('/writeblog').replace();
        }
    } else {
        alert('您还未登录，请先登录');
        $location.path('/login').replace();
    }
}]);

// 写博客页面
app.controller('writeBlogCtrl', ['$scope', '$rootScope', '$http', '$location', '$interval', function ($scope, $rootScope, $http, $location, $interval) {
    if ($rootScope.isLogin && !$rootScope.isLogout) {

        $rootScope.isMyblog = true;
        $scope.user = $rootScope.user;
        $scope.blog = {
            "title": "",
            "content": "",
            "date": ""
        };
        $scope.blog.date = new Date().toLocaleTimeString();
        $interval(function () {
            $scope.blog.date = new Date().toLocaleTimeString();
        }, 1000);

        $scope.blogPublish = function () {
            if ($scope.blog.title !== "" && $scope.blog.content !== "") {
                $http({
                    method: 'post',
                    url: '/postBlogs',
                    data: $scope.blog
                }).then(function (res) {
                    if (res.data.status === 200) {
                        alert('提交成功');
                        $location.path('/writeblog').replace();
                    }
                    else if (res.data.status === 403.3) {
                        alert('提交失败');
                        $location.path('/writeblog').replace();
                    }
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

// 自定义验证用户名的指令
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

// 自定义密码一致性验证
// 自定义验证用户名的指令
app.directive("passwordRepeat", function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            //scope.$watch(attrs.ngModel, function (viewValue) {
                //     var firstPassword = '#' + attrs.passwordRepeat;
                //     elem.add(firstPassword).on('keyup', function () {
                //         scope.$apply(function () {
                //             var value = elem.val() === $(firstPassword).val();
                //             ctrl.$setValidity('repeat', value);
                //         });
                //     });
                //     
            //});
            var otherInput = elem.inheritedData("$formController")[attrs.passwordRepeat];
            ctrl.$parsers.push(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });
             otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;

            });
        }
    }
})
// 判断祖先元素是否为指定元素（一级级向上查找，直到找到或者到body元素）
function getParentByClassName(child, parentClass) {
    var parent;
    // 如果当前元素为要找的元素，则返回当前元素
    // if (child.className === parentClass)// 修改前
    if (child.classList.contains(parentClass))// 修改后获取所有类名列表，查看列表中是否包含
        parent = child;
    else {// 否则，查看其父元素是否为要找的元素，一直向上查询直到找到或者到达body，也就是没找到
        while (!(child.parentNode.classList.contains(parentClass)) && child.parentNode.tagName != "body") {
            child = child.parentNode;
        }
        parent = child.parentNode;
    }
    return parent;
}