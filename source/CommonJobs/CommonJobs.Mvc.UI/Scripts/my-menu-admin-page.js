var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var MyMenu;
(function (MyMenu) {
    var AdminPage = (function (_super) {
        __extends(AdminPage, _super);
        function AdminPage() {
                _super.call(this);
            ko.applyBindings(this);
        }
        AdminPage.prototype.load = function () {
            var _this = this;
            $.ajax(urlGenerator.action("MenuDefinition", "MyMenu", ViewData.menuId), {
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    _this.reset(data);
                },
                error: function (jqXHR) {
                    alert("Error getting MenuDefinition");
                    $("html").html(jqXHR.responseText);
                }
            });
        };
        AdminPage.prototype.save = function () {
            var _this = this;
            var data = this.exportData();
            $.ajax(urlGenerator.action("MenuDefinition", "MyMenu"), {
                type: "POST",
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
                success: function (data) {
                    _this.load();
                },
                error: function (jqXHR) {
                    alert("Error saving MenuDefinition");
                    $("html").html(jqXHR.responseText);
                }
            });
        };
        return AdminPage;
    })(MyMenu.MenuDefinition);
    MyMenu.AdminPage = AdminPage;    
    $(document).ready(function () {
        var adminController = new AdminPage();
        adminController.load();
    });
})(MyMenu || (MyMenu = {}));

