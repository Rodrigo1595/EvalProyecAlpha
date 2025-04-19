sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/microchart/InteractiveDonutChartSegment",
    "sap/ui/core/ResizeHandler"

], (Controller, MessageToast, JSONModel, InteractiveDonutChartSegment, ResizeHandler) => {
    "use strict";

    return Controller.extend("raccoon.devs.evalproyectos.controller.Principal", {
        _resizeHandlerId: null, // Guarda el handler para eliminarlo luego si es necesario

        onInit() {
            this.cargarProductos()

            var oGrid = this.getView().byId("demoGrid");

            if (oGrid) {
                // Registrar el ResizeHandler una vez, escuchará siempre los cambios de tamaño
                this._resizeHandlerId = ResizeHandler.register(oGrid, function (oEvent) {
                    var iWidth = oEvent.size.width;

                    if (iWidth <= 480) {
                        // Pantalla extra pequeña (XS)
                        oGrid.removeStyleClass("sapUiSmallMargin");
                        oGrid.addStyleClass("sapUiTinyMargin");

                    } else {
                        // Pantalla normal o grande
                        oGrid.removeStyleClass("sapUiTinyMargin");
                        oGrid.addStyleClass("sapUiSmallMargin");

                    }
                });
            }

        },

        cargarProductos: async function () {
            let oModel = this.getOwnerComponent().getModel()
            var that = this;
            oModel.read("/Products", {
                success: function (data) {
                    let oModel = new JSONModel(data);
                    that.getOwnerComponent().setModel(oModel, "modelProductos")

                    const chart = that.byId("donutChart")

                    //Agregar programáticamente cada uno de los productos como un microchart segment
                    let totalItems = 0


                    for (let index = 0; index < 4; index++) {
                        totalItems = totalItems + data.results[index].UnitsInStock
                    }

                    for (let index = 0; index < 4; index++) {
                        chart.addSegment(new InteractiveDonutChartSegment({
                            label: data.results[index].ProductName,
                            value: Math.round((data.results[index].UnitsInStock * 100)) / totalItems,
                            displayedValue: Math.round((data.results[index].UnitsInStock * 100) / totalItems) + "%",
                            color: data.results[index].UnitsInStock > 30 ? "Good" : data.results[index].UnitsInStock <= 10 ? "Critical" : "Error"
                        }));

                    }


                },
                error: function (error) {
                    console.log(error)
                }
            })

            //Refrescar insumos
            

        },

        onPress: function (oEvent) {
            MessageToast.show("Pressed on " + oEvent.getSource().getSender());
        },

        onActionPressed: function (oEvent) {
            var sAction = oEvent.getSource().getKey();

            if (sAction === "delete") {
                this.removeItem(oEvent.getParameter("item"));
                MessageToast.show("Item deleted");
            } else {
                MessageToast.show("Action \"" + sAction + "\" pressed.");
            }
        },

        removeItem: function (oFeedListItem) {
            var sFeedListItemBindingPath = oFeedListItem.getBindingContext().getPath();
            var sFeedListItemIndex = sFeedListItemBindingPath.split("/").pop();
            var aFeedCollection = this.getView().getModel().getProperty("/EntryCollection");

            aFeedCollection.splice(sFeedListItemIndex, 1);
            this.getView().getModel().setProperty("/EntryCollection", aFeedCollection);
        },


        onNavigationFinished: function (evt) {
            var toPage = evt.getParameter("to");
            MessageToast.show("Navigation to page '" + toPage.getTitle() + "' finished");
        },

        handleNav: function (evt) {
            var navCon = this.byId("navCon");
            var target = evt.getSource().data("target");
            if (target) {
                navCon.to(this.byId(target), "slide");
            } else {
                navCon.back();
            }
        },
        press: function (oEvent) {
            MessageToast.show("The Interactive Donut Chart is pressed.");
        },
        onSelectionChanged: function (oEvent) {
            var oSegment = oEvent.getParameter("segment");
            MessageToast.show("The selection changed: " + oSegment.getLabel() + " " + ((oSegment.getSelected()) ? "selected" : "not selected"));
        },
        onRevealGrid: function () {
            RevealGrid.toggle("demoGrid", this.getView());
        },

        onExit: function () {
            RevealGrid.destroy("demoGrid", this.getView());
        },

        onPress: function (oEvent) {
            MessageToast.show("Boton navegar a próxima aplicación " + oEvent.getSource().getMetadata().getName());
        },

        handleSwipe: function (evt) {   // register swipe event
            var oSwipeContent = evt.getParameter("swipeContent"), // get swiped content from event
                oSwipeDirection = evt.getParameter("swipeDirection"); // get swiped direction from event
            var msg = "";

            if (oSwipeDirection === "BeginToEnd") {
                // List item is approved, change swipeContent(button) text to Disapprove and type to Reject
                oSwipeContent.setText("Approve").setType("Accept");
                msg = 'Swipe direction is from the beginning to the end (left ro right in LTR languages)';

            } else {
                // List item is not approved, change swipeContent(button) text to Approve and type to Accept
                oSwipeContent.setText("Disapprove").setType("Reject");
                msg = 'Swipe direction is from the end to the beginning (right to left in LTR languages)';
            }
            MessageToast.show(msg);
        },

        handleReject: function (evt) {
            var oList = evt.getSource().getParent();
            oList.removeAggregation("items", oList.getSwipedItem());
            oList.swipeOut();
        }


    });
});