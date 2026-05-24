import React, { useState, useRef, useEffect } from 'react';

import {
  Stage,
  Layer,
  Text,
  Transformer
} from 'react-konva';

import html2canvas from 'html2canvas';

import EmojiPicker from 'emoji-picker-react';

import ReactHowler from 'react-howler';

import { SketchPicker } from 'react-color';

import { motion, AnimatePresence } from 'framer-motion';

import {
  FaTimes,
  FaCloudUploadAlt,
  FaSpinner,
  FaPalette,
  FaSmile,
  FaTextHeight,
  FaTrash,
  FaUndo,
  FaRedo,
  FaMagic,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const fonts = [
  'Arial',
  'Impact',
  'Poppins',
  'Montserrat',
  'Bebas Neue'
];

const filters = [
  {
    name: 'Normal',
    value: 'none'
  },
  {
    name: 'Grayscale',
    value: 'grayscale(100%)'
  },
  {
    name: 'Sepia',
    value: 'sepia(100%)'
  },
  {
    name: 'Bright',
    value: 'brightness(120%)'
  },
  {
    name: 'Dark',
    value: 'brightness(70%)'
  },
  {
    name: 'Cool',
    value: 'contrast(120%) saturate(140%)'
  }
];

const generateId = () => {
  return `layer_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

const EditableText = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDoubleClick
}) => {

  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {

    if (isSelected && trRef.current && textRef.current) {

      trRef.current.nodes([textRef.current]);

      trRef.current.getLayer()?.batchDraw();

    }

  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        {...shapeProps}
        id={String(shapeProps.id)}
        draggable
        perfectDrawEnabled
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDoubleClick}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.5}
        shadowOffset={{ x: 2, y: 2 }}
        onDragEnd={(e) => {

          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y()
          });

        }}
        onTransformEnd={() => {

          const node = textRef.current;

          const scaleX = node.scaleX();

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(
              20,
              shapeProps.fontSize * scaleX
            )
          });

          node.scaleX(1);
          node.scaleY(1);

        }}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
        />
      )}
    </>
  );

};

const StoryCreatorModal = ({
  onClose,
  api
}) => {

  const editorRef = useRef(null);

  const fileInputRef = useRef(null);

  const videoRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [selectedMedia, setSelectedMedia] =
    useState(null);

  const [mediaType, setMediaType] =
    useState('image');

  const [caption, setCaption] = useState('');

  const [layers, setLayers] = useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [showColorPicker, setShowColorPicker] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedColor, setSelectedColor] =
    useState('#ffffff');

  const [selectedFont, setSelectedFont] =
    useState('Poppins');

  const [currentFilter, setCurrentFilter] =
    useState('none');

  const [isUploading, setIsUploading] =
    useState(false);

  const [musicUrl, setMusicUrl] =
    useState(null);

  const [history, setHistory] = useState([]);

  const [redoStack, setRedoStack] =
    useState([]);

  useEffect(() => {

    const resize = () => {

      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

    };

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener(
        'resize',
        resize
      );
    };

  }, []);

  const saveHistory = (newLayers) => {

    setHistory((prev) => [...prev, layers]);

    setRedoStack([]);

    setLayers(newLayers);

  };

  const undo = () => {

    if (!history.length) return;

    const previous =
      history[history.length - 1];

    setRedoStack((prev) => [
      ...prev,
      layers
    ]);

    setLayers(previous);
const exportStory = async () => {
    try {
      // html2canvas oklab bug fix
      const canvas = await html2canvas(editorRef.current, {
        useCORS: true,
        backgroundColor: '#000000',
        allowTaint: true,
        logging: false,
        // এই অংশটি যোগ করুন
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.colorScheme = 'light';
        }
      });

      return canvas.toDataURL('image/png', 1);
    } catch (err) {
      console.error('Export Error:', err);
      return null;
    }
  };
      redoStack[redoStack.length - 1];

    setHistory((prev) => [
      ...prev,
      layers
    ]);

    setLayers(next);

    setRedoStack((prev) =>
      prev.slice(0, -1)
    );

  };

  const handleFileChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setSelectedMedia(url);

    setMediaType(
      file.type.startsWith('video/')
        ? 'video'
        : 'image'
    );

  };

  const addText = () => {

    const newText = {
      id: generateId(),
      text: 'Double Click',
      x: dimensions.width / 3,
      y: dimensions.height / 3,
      fontSize: 42,
      fill: selectedColor,
      fontFamily: selectedFont,
      rotation: 0,
      fontStyle: 'bold'
    };

    saveHistory([...layers, newText]);

  };

  const addEmoji = (emojiData) => {

    const newEmoji = {
      id: generateId(),
      text: emojiData.emoji,
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      fontSize: 60,
      fill: '#ffffff',
      fontFamily: 'Arial',
      rotation: 0
    };

    saveHistory([...layers, newEmoji]);

    setShowEmoji(false);

  };

  const updateLayer = (id, attrs) => {

    const updated = layers.map((layer) =>
      layer.id === id
        ? attrs
        : layer
    );

    setLayers(updated);

  };

  const deleteSelected = () => {

    if (!selectedId) return;

    saveHistory(
      layers.filter(
        (layer) =>
          layer.id !== selectedId
      )
    );

    setSelectedId(null);

  };

  const bringToFront = () => {

    if (!selectedId) return;

    const item = layers.find(
      (l) => l.id === selectedId
    );

    const filtered = layers.filter(
      (l) => l.id !== selectedId
    );

    setLayers([...filtered, item]);

  };

  const sendToBack = () => {

    if (!selectedId) return;

    const item = layers.find(
      (l) => l.id === selectedId
    );

    const filtered = layers.filter(
      (l) => l.id !== selectedId
    );

    setLayers([item, ...filtered]);

  };

  const exportStory = async () => {

    try {

      // html2canvas oklab bug fix
      document.body.style.colorScheme =
        'light';

      const canvas = await html2canvas(
        editorRef.current,
        {
          useCORS: true,
          backgroundColor: '#000000',
          allowTaint: true,
          logging: false
        }
      );

      return canvas.toDataURL(
        'image/png',
        1
      );

    } catch (err) {

      console.error(
        'Export Error:',
        err
      );

      return null;

    }

  };

  const handleSubmit = async () => {

    try {

      setIsUploading(true);

      const storyImage =
        await exportStory();

      if (!storyImage) {

        setIsUploading(false);

        return;

      }

      if (api) {

        await api.post(
          '/story/upload',
          {
            type: mediaType,
            story: storyImage,
            caption,
            music: musicUrl
          }
        );

      }

      setTimeout(() => {

        setIsUploading(false);

        onClose();

      }, 1000);

    } catch (err) {

      console.error(err);

      setIsUploading(false);

    }

  };

  return (
    <AnimatePresence mode="wait">

      <motion.div
        key="story-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] bg-black overflow-hidden"
      >

        <div
          ref={editorRef}
          className="w-full h-full relative bg-black overflow-hidden"
        >

          {/* MUSIC */}

          {musicUrl && (
            <ReactHowler
              src={musicUrl}
              playing={true}
              loop={true}
              volume={1}
            />
          )}

          {/* MEDIA */}

          {!selectedMedia ? (

            <div
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="w-full h-full flex flex-col items-center justify-center"
            >

              <FaCloudUploadAlt
                size={80}
                className="text-purple-500 mb-5"
              />

              <p className="text-white text-sm uppercase tracking-[4px]">
                Upload Story
              </p>

            </div>

          ) : (

            <>
              {mediaType === 'image' ? (

                <img
                  src={selectedMedia}
                  alt="story"
                  className="w-full h-full object-cover"
                  style={{
                    filter: currentFilter
                  }}
                />

              ) : (

                <video
                  ref={videoRef}
                  src={selectedMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{
                    filter: currentFilter
                  }}
                />

              )}

              <div className="absolute inset-0 bg-black/10" />

              {/* KONVA */}

              <Stage
                width={dimensions.width}
                height={dimensions.height}
                className="absolute inset-0"
                onMouseDown={(e) => {

                  const clickedOnEmpty =
                    e.target ===
                    e.target.getStage();

                  if (clickedOnEmpty) {
                    setSelectedId(null);
                  }

                }}
              >

                <Layer>

                  {layers.map((layer) => (

                    <EditableText
                      key={layer.id}
                      shapeProps={layer}
                      isSelected={
                        selectedId === layer.id
                      }
                      onSelect={() =>
                        setSelectedId(
                          layer.id
                        )
                      }
                      onDoubleClick={() => {

                        const text = prompt(
                          'Edit Text',
                          layer.text
                        );

                        if (
                          text !== null
                        ) {

                          const updated =
                            layers.map(
                              (l) =>
                                l.id ===
                                layer.id
                                  ? {
                                      ...l,
                                      text
                                    }
                                  : l
                            );

                          setLayers(
                            updated
                          );

                        }

                      }}
                      onChange={(
                        newAttrs
                      ) =>
                        updateLayer(
                          layer.id,
                          newAttrs
                        )
                      }
                    />

                  ))}

                </Layer>

              </Stage>

            </>

          )}

          {/* HEADER */}

          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-xl text-white flex items-center justify-center"
            >
              <FaTimes />
            </button>

            <div className="text-white text-xs tracking-[5px] font-black">
              ONYX STORY
            </div>

            <button
              onClick={handleSubmit}
              disabled={isUploading}
              className="bg-white text-black px-5 h-11 rounded-full font-black text-xs tracking-[2px]"
            >

              {isUploading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                'SHARE'
              )}

            </button>

          </div>

          {/* TOOLBAR */}

          <div className="absolute right-4 top-24 z-50 flex flex-col gap-4">

            <button
              onClick={addText}
              className="tool-btn"
            >
              <FaTextHeight />
            </button>

            <button
              onClick={() =>
                setShowEmoji(
                  !showEmoji
                )
              }
              className="tool-btn"
            >
              <FaSmile />
            </button>

            <button
              onClick={() =>
                setShowColorPicker(
                  !showColorPicker
                )
              }
              className="tool-btn"
            >
              <FaPalette />
            </button>

            <button
              onClick={() =>
                setShowFilters(
                  !showFilters
                )
              }
              className="tool-btn"
            >
              <FaMagic />
            </button>

            <button
              onClick={bringToFront}
              className="tool-btn"
            >
              <FaArrowUp />
            </button>

            <button
              onClick={sendToBack}
              className="tool-btn"
            >
              <FaArrowDown />
            </button>

            <button
              onClick={deleteSelected}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <FaTrash />
            </button>

          </div>

          {/* COLOR PICKER */}

          {showColorPicker && (

            <div className="absolute left-4 top-24 z-50">

              <SketchPicker
                color={selectedColor}
                onChange={(color) => {

                  setSelectedColor(
                    color.hex
                  );

                  if (
                    selectedId
                  ) {

                    const updated =
                      layers.map(
                        (l) =>
                          l.id ===
                          selectedId
                            ? {
                                ...l,
                                fill: color.hex
                              }
                            : l
                      );

                    setLayers(
                      updated
                    );

                  }

                }}
              />

            </div>

          )}

          {/* FILTERS */}

          {showFilters && (

            <div className="absolute bottom-28 left-0 right-0 px-4 z-50">

              <div className="flex gap-3 overflow-x-auto">

                {filters.map(
                  (filterItem) => (

                    <button
                      key={
                        filterItem.name
                      }
                      onClick={() =>
                        setCurrentFilter(
                          filterItem.value
                        )
                      }
                      className="min-w-fit px-5 py-3 rounded-full bg-white/20 backdrop-blur-xl text-white text-xs font-bold"
                    >
                      {
                        filterItem.name
                      }
                    </button>

                  )
                )}

              </div>

            </div>

          )}

          {/* EMOJI */}

          {showEmoji && (

            <div className="absolute bottom-28 left-0 right-0 flex justify-center z-50">

              <EmojiPicker
                onEmojiClick={
                  addEmoji
                }
                theme="dark"
              />

            </div>

          )}

          {/* FOOTER */}

          <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">

            <div className="flex items-center gap-2 mb-4">

              <button
                onClick={undo}
                className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                <FaUndo />
              </button>

              <button
                onClick={redo}
                className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center"
              >
                <FaRedo />
              </button>

              <input
                value={caption}
                onChange={(e) =>
                  setCaption(
                    e.target.value
                  )
                }
                placeholder="Add caption..."
                className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-xl px-5 text-white outline-none"
              />

            </div>

            {/* FONT SELECT */}

            <div className="flex gap-2 overflow-x-auto">

              {fonts.map((font) => (

                <button
                  key={font}
                  onClick={() => {

                    setSelectedFont(
                      font
                    );

                    if (
                      selectedId
                    ) {

                      const updated =
                        layers.map(
                          (l) =>
                            l.id ===
                            selectedId
                              ? {
                                  ...l,
                                  fontFamily:
                                    font
                                }
                              : l
                        );

                      setLayers(
                        updated
                      );

                    }

                  }}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs whitespace-nowrap"
                  style={{
                    fontFamily: font
                  }}
                >
                  {font}
                </button>

              ))}

            </div>

          </div>

          {/* FILE INPUT */}

          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

        </div>

        <style>{`
          .tool-btn {
            width: 48px;
            height: 48px;
            border-radius: 9999px;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.25s;
          }

          .tool-btn:hover {
            transform: scale(1.08);
            background: rgba(168,85,247,0.8);
          }

          *::-webkit-scrollbar {
            display: none;
          }
        `}</style>

      </motion.div>

    </AnimatePresence>
  );

};

export default StoryCreatorModal;