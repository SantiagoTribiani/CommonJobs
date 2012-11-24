var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var MyMenu;
(function (MyMenu) {
    $(document).ready(function () {
        var myMenuPage = new MyMenuPage();
        myMenuPage.load();
    });
    var MyMenuPage = (function (_super) {
        __extends(MyMenuPage, _super);
        function MyMenuPage() {
                _super.call(this, new MyMenu.MenuDefinition(), null, ViewData.now);
            ko.applyBindings(this);
        }
        MyMenuPage.prototype.load = function () {
            var _this = this;
            $.ajax(ViewData.menuUrl, {
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                success: function (employeeMenuDTO) {
                    _this.menu.reset(employeeMenuDTO.MenuDefinition);
                    _this.reset(employeeMenuDTO.EmployeeMenu);
                },
                error: function (jqXHR) {
                    alert("Error getting EmployeeMenu");
                    $("html").html(jqXHR.responseText);
                }
            });
        };
        MyMenuPage.prototype.save = function () {
            var data = this.exportData();
            $.ajax(ViewData.menuUrl, {
                type: "POST",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
                success: this.load,
                error: function (jqXHR) {
                    alert("Error saving EmployeeMenu");
                    $("html").html(jqXHR.responseText);
                }
            });
        };
        return MyMenuPage;
    })(MyMenu.EmployeeMenuDefinition);
    MyMenu.MyMenuPage = MyMenuPage;    
})(MyMenu || (MyMenu = {}));

