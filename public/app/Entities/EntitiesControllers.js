'use strict';

angular
    .module('entities')
    .controller('EntitiesCtrl', EntitiesCtrl)
    .controller('EntityCtrl', EntityCtrl);

function EntitiesCtrl($scope, $state, EntitiesSvc) {

    $scope.loading = true;

    EntitiesSvc
        .read()
        .then(function (result) {
            $scope.entities = result;
            $scope.loading = false;
        });

    $scope.new = function () {
        $state.go('base.entity');
    };

    $scope.edit = function (entity) {
        $state.go('base.entity', {id: entity._id});
    }

}


function EntityCtrl($scope, $state, $mdDialog, $mdToast, EntitiesSvc) {

    $scope.canUpdate = false;

    var id = $state.params.id;

    if (id) {
        $scope.loading = true;
        EntitiesSvc
            .readById(id)
            .then(function (result) {
                if ($scope.profile._id == result.user || $scope.profile.isAdmin)
                    $scope.canUpdate = true;
                $scope.entity = result;
                $scope.loading = false;
            });
    }
    else {
        $scope.canUpdate = true;
        $scope.entity = {approved: false};
    }

    $scope.save = function (entity) {
        if (id) {
            EntitiesSvc
                .update(id, entity)
                .then(function (result) {
                    entity._rev = result.rev;
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Topic saved')
                            .position("bottom left")
                            .hideDelay(3000)
                    );
                    $state.go('base.entities');
                });
        } else
            EntitiesSvc
                .create(entity)
                .then(function (result) {
                    $state.go('base.entity', {id: result.id});
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Topic created')
                            .position("bottom left")
                            .hideDelay(3000)
                    );
                });
    };

    $scope.delete = function (entity) {
        var confirm = $mdDialog
            .confirm()
            .title('Are you sure to delete this topic?')
            .textContent('All data  will be deleted.')
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog
            .show(confirm)
            .then(function () {
                $scope.loading = true;
                EntitiesSvc
                    .delete(id)
                    .then(function (result) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Topic deleted')
                                .position("bottom left")
                                .hideDelay(3000)
                        );
                        $state.go('base.entities');
                    });
            });
    };

    $scope.back = function () {
        $state.go('base.entities');
    };

    // Items

    $scope.new = function () {
        $scope.edit({entity: id});
    };

    $scope.edit = function (item) {
        if (!$scope.canUpdate)
            return false;
        $scope.item = item;
        $mdDialog
            .show({
                templateUrl: 'app/Entities/EntityItem.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true,
                scope: $scope,
                preserveScope: true,
                controller: function EntityItemCtrl($scope, $mdDialog, EntitiesItemsSvc) {
                    $scope.saveItem = function (item, insertOther) {
                        $scope.loading = true;
                        if (item._id) {
                            EntitiesItemsSvc
                                .update(item._id, item)
                                .then(function (result) {
                                    item._rev = result.rev;
                                    if (insertOther) {
                                        $scope.item = {entity: item.entity};
                                    } else
                                        $mdDialog.hide();
                                    $scope.loading = false;
                                });
                        } else
                            EntitiesItemsSvc
                                .create(item)
                                .then(function (result) {
                                    item._id = result.id;
                                    item._rev = result.rev;
                                    $scope.entity.items.push(item);
                                    if (insertOther) {
                                        $scope.item = {entity: item.entity};
                                    } else
                                        $mdDialog.hide();
                                    $scope.loading = false;
                                });
                    };
                    $scope.deleteItem = function (item) {
                        $scope.loading = true;
                        EntitiesItemsSvc
                            .delete(item._id)
                            .then(function (result) {
                                $scope.entity.items.splice($scope.entity.items.indexOf(item), 1);
                                $mdDialog.hide();
                                $scope.loading = false;
                            });
                    };
                    $scope.closeItem = function () {
                        $mdDialog.hide();
                    }
                }
            });
    };

}