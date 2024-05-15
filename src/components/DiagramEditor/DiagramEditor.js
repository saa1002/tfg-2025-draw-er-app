import * as React from "react";
import "./styles/diagramEditor.css";
import { default as MxGraph } from "mxgraph";
import { CompactPicker } from "react-color";
import {
    getStyleByKey,
    setInitialConfiguration,
    configureKeyBindings
} from "./utils";

const {
    mxGraph,
    mxEvent,
} = MxGraph();

export default function App(props) {
    const containerRef = React.useRef(null);
    const toolbarRef = React.useRef(null);
    const [colorPickerVisible, setColorPickerVisible] = React.useState(false);
    const [selected, setSelected] = React.useState(null);
    const [colorPickerType, setColorPickerType] = React.useState(null);
    const [graph, setGraph] = React.useState(null);

    React.useEffect(() => {
        if (!graph) {
            mxEvent.disableContextMenu(containerRef.current);
            setGraph(new mxGraph(containerRef.current));
        }
        // Adds cells to the model in a single step
        if (graph) {
            console.log(graph)
            // setInitialConfiguration(graph, toolbarRef);
            setInitialConfiguration(graph, toolbarRef);
            configureKeyBindings(graph);

            // Updates the display
            graph.getModel().endUpdate();
            graph.getModel().addListener(mxEvent.CHANGE, onChange);
            graph.getSelectionModel().addListener(mxEvent.CHANGE, onSelected);
            graph.getModel().addListener(mxEvent.ADD, onElementAdd);
            graph.getModel().addListener(mxEvent.MOVE_END, onDragEnd);
        }
    }, [graph]);

    React.useEffect(() => {
        if (graph) {
            // NOTE: Print the current graph cells
            console.log(graph.model.cells)
        }
    })

    const onChange = evt => {
        if (props.onChange) {
            props.onChange(evt);
        }
    };

    const onSelected = evt => {
        if (props.onSelected) {
            props.onSelected(evt);
        }
        setSelected(evt.cells[0]);
        setColorPickerVisible(false);
        // console.log(mxVertexHandler.getSelectionColor());
    };

    const onElementAdd = evt => {
        if (props.onElementAdd) {
            props.onElementAdd(evt);
        }
    };

    const onDragEnd = evt => {
        if (props.onDragEnd) {
            props.onDragEnd(evt);
        }
    };

    const updateCellColor = (type, color) => {
        graph.setCellStyles(type, color.hex);
    };

    const pushCellsBack = (moveBack) => () => {
        graph.orderCells(moveBack);
    };

    const renderMoveBackAndFrontButtons = () => selected &&
        <React.Fragment>
            <button className="button-toolbar-action" onClick={pushCellsBack(true)}>Move back</button>
            <button className="button-toolbar-action" onClick={pushCellsBack(false)}>Move front</button>
        </React.Fragment>;

    const renderColorChange = (type, content) => {
        if (!selected) {
            return null;
        }
        return (
            <button
                className={"button-toolbar-action"}
                onClick={() => {
                    setColorPickerVisible(!colorPickerVisible);
                    setColorPickerType(type);
                }}
                style={{
                    backgroundColor: selected.style && getStyleByKey(selected.style, type)
                }}
            >
                {content}
            </button>
        );
    };

    const renderColorPicker = () =>
        colorPickerVisible &&
        selected && (
            <div>
                <div className="toolbar-separator" />
                <CompactPicker
                    color={selected.style && getStyleByKey(selected.style, "fillColor")}
                    onChange={color => {
                        updateCellColor(colorPickerType, color);
                    }}
                />
            </div>
        );

    return (
        <div className="mxgraph-container">
            <div className="mxgraph-toolbar-container">
                <div className="mxgraph-toolbar-container" ref={toolbarRef} />
                <div>
                    {renderMoveBackAndFrontButtons()}
                    {renderColorChange("fillColor", "Change fill color")}
                    {renderColorChange("fontColor", "Change font color")}
                    {renderColorChange("strokeColor", "Change border color")}
                </div>
                {renderColorPicker()}
            </div>
            <div ref={containerRef} className="mxgraph-drawing-container" />
        </div>
    );
}
