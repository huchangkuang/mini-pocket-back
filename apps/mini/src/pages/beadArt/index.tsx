import React, { useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import {
  Canvas,
  Image,
  Slider,
  View,
  ScrollView,
  Text,
} from "@tarojs/components";
import ExcelJS from "exceljs";
import "./index.scss";
import { AtIcon, AtButton } from "taro-ui";

interface PixelData {
  color: string;
  x: number;
  y: number;
}

const BeadArt: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [pixelSize, setPixelSize] = useState<number>(10);
  const [pixelData, setPixelData] = useState<PixelData[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [imageData, setImageData] = useState<Uint8ClampedArray | null>(null);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [excelFilePath, setExcelFilePath] = useState<string>("");
  const [isExcelGenerated, setIsExcelGenerated] = useState<boolean>(false);

  const chooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setImageUrl(tempFilePath);
        processImage(tempFilePath);
      },
    });
  };

  const processImage = (imgPath: string) => {
    Taro.getImageInfo({
      src: imgPath,
      success: (imgInfo) => {
        const { width, height } = imgInfo;
        const maxSize = 300;
        let canvasWidth = width;
        let canvasHeight = height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          canvasWidth = Math.floor(width * ratio);
          canvasHeight = Math.floor(height * ratio);
        }

        setCanvasSize({ width: canvasWidth, height: canvasHeight });

        setTimeout(() => {
          const query = Taro.createSelectorQuery();
          query
            .select("#beadCanvas")
            .fields({ node: true, size: true })
            .exec((res) => {
              if (!res || !res[0]) {
                return;
              }

              const canvas = res[0].node;
              const ctx = canvas.getContext("2d");

              const img = canvas.createImage();
              img.src = imgPath;
              img.onload = () => {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

                const imageData = ctx.getImageData(
                  0,
                  0,
                  canvasWidth,
                  canvasHeight
                );
                setImageData(imageData.data);
                const pixels = extractPixelData(
                  imageData.data,
                  canvasWidth,
                  canvasHeight
                );
                setPixelData(pixels);
              };
            });
        }, 100);
      },
    });
  };

  const extractPixelData = (
    imageData: Uint8ClampedArray,
    width: number,
    height: number
  ): PixelData[] => {
    const pixels: PixelData[] = [];
    const step = Math.max(1, Math.floor(pixelSize));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3];

        if (a > 128) {
          const color = rgbToHex(r, g, b);
          pixels.push({ color, x, y });
        }
      }
    }

    return pixels;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const handlePixelSizeChange = (value: number) => {
    setPixelSize(value);
    if (imageUrl) {
      processImage(imageUrl);
    }
  };

  const generateExcel = () => {
    if (pixelData.length === 0 || !imageData) {
      Taro.showToast({
        title: "请先上传图片",
        icon: "none",
      });
      return;
    }

    const step = Math.max(1, Math.floor(pixelSize));
    const cols = Math.ceil(canvasSize.width / step);
    const rows = Math.ceil(canvasSize.height / step);

    if (cols > 16384 || rows > 1048576) {
      Taro.showToast({
        title: "像素太小，Excel无法生成",
        icon: "none",
      });
      return;
    }

    const data: any[][] = [];

    for (let row = 0; row < rows; row++) {
      const rowData: any[] = [];
      for (let col = 0; col < cols; col++) {
        const x = col * step;
        const y = row * step;

        const index = (y * canvasSize.width + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3];

        if (a > 128) {
          const color = rgbToHex(r, g, b);
          rowData.push(color);
        } else {
          rowData.push("");
        }
      }
      data.push(rowData);
    }

    setExcelData(data);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("拼豆数据");

    const cellWidth = 3;
    const cellHeight = 15;

    worksheet.columns = Array.from({ length: cols }, (_, i) => ({
      key: String.fromCharCode(65 + (i % 26)),
      width: cellWidth,
    }));

    data.forEach((row, rowIndex) => {
      const rowData: any[] = row.map((cellValue) => "");
      const excelRow = worksheet.addRow(rowData);
      excelRow.height = cellHeight;

      row.forEach((cellValue, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        cell.border = {
          top: { style: "thin", color: { argb: "FFD3D3D3" } },
          left: { style: "thin", color: { argb: "FFD3D3D3" } },
          bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
          right: { style: "thin", color: { argb: "FFD3D3D3" } },
        };
        if (cellValue) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: cellValue.replace("#", "") },
          };
        }
      });
    });

    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        const fileName = `拼豆_${Date.now()}.xlsx`;
        const filePath = `${Taro.env.USER_DATA_PATH}/${fileName}`;

        const uint8Array = new Uint8Array(buffer);
        const binaryString = Array.from(uint8Array, (byte) =>
          String.fromCharCode(byte)
        ).join("");

        const fs = Taro.getFileSystemManager();
        fs.writeFile({
          filePath,
          data: binaryString,
          encoding: "binary",
          success: () => {
            setExcelFilePath(filePath);
            setIsExcelGenerated(true);
            Taro.showToast({
              title: "Excel生成成功",
              icon: "success",
            });
          },
          fail: (err) => {
            console.error("保存Excel失败:", err);
            Taro.showToast({
              title: "生成失败",
              icon: "none",
            });
          },
        });
      })
      .catch((err) => {
        console.error("生成Excel失败:", err);
        Taro.showToast({
          title: "生成失败",
          icon: "none",
        });
      });
  };

  const downloadExcel = async () => {
    if (!excelFilePath) {
      Taro.showToast({
        title: "请先生成Excel",
        icon: "none",
      });
      return;
    }

    Taro.showLoading({ title: "准备保存..." });

    try {
      const fs = Taro.getFileSystemManager();
      const fileName = `拼豆_${Date.now()}.xlsx`;
      const savedFilePath = `${Taro.env.USER_DATA_PATH}/${fileName}`;

      fs.copyFile({
        srcPath: excelFilePath,
        destPath: savedFilePath,
        success: () => {
          Taro.hideLoading();
          Taro.openDocument({
            filePath: savedFilePath,
            fileType: "xlsx",
            showMenu: true,
            success: () => {
              console.log("打开文档成功");
              Taro.showToast({
                title: "请在打开的文档中点击右上角三个点选择保存位置",
                icon: "none",
                duration: 3000,
              });
            },
            fail: (err) => {
              console.error("打开文档失败:", err);
              Taro.showToast({
                title: "打开失败，请重试",
                icon: "none",
              });
            },
          });
        },
        fail: (err) => {
          console.error("复制文件失败:", err);
          Taro.hideLoading();
          Taro.showToast({
            title: "保存失败，请重试",
            icon: "none",
          });
        },
      });
    } catch (err) {
      console.error("保存文件出错:", err);
      Taro.hideLoading();
      Taro.showToast({
        title: "保存失败，请重试",
        icon: "none",
      });
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setPixelData([]);
  };

  useShareAppMessage(() => {
    return {
      title: "拼豆图片生成",
      path: "/pages/beadArt/index",
    };
  });

  return (
    <View className="beadArt">
      <View className="uploadSection">
        {!imageUrl ? (
          <View className="uploadPlaceholder" onClick={chooseImage}>
            <AtIcon value="image" size="60" color="#d5f5e3" />
            <View className="uploadText">点击上传图片</View>
          </View>
        ) : (
          <View className="imagePreview">
            <Image src={imageUrl} mode="aspectFit" className="previewImage" />
            <AtIcon
              value="close-circle"
              size="24"
              color="#999"
              className="closeIcon"
              onClick={clearImage}
            />
          </View>
        )}
      </View>

      {imageUrl && (
        <View className="controls">
          <View className="controlItem">
            <View className="controlLabel">
              像素大小: {pixelSize}px{" "}
              <Text className="unit">(调整像素后请重新生成Excel)</Text>
            </View>
            <View className="controlTip">
              像素越小，生成的图片越精细，但同时方块格越多！
            </View>
            <Slider
              value={pixelSize}
              min={3}
              max={20}
              step={1}
              activeColor="#d5f5e3"
              backgroundColor="#e0e0e0"
              showValue={false}
              onChange={(e) => handlePixelSizeChange(e.detail.value)}
            />
          </View>
          <View className="buttonGroup">
            <AtButton
              type="primary"
              size="normal"
              className="generateButton"
              onClick={generateExcel}
            >
              生成Excel
            </AtButton>
            <AtButton
              type="secondary"
              size="normal"
              className="downloadButton"
              onClick={downloadExcel}
              disabled={!isExcelGenerated}
            >
              保存Excel
            </AtButton>
          </View>
        </View>
      )}

      {isExcelGenerated && excelData.length > 0 && (
        <View className="excelPreview">
          <View className="previewHeader">
            <Text className="previewTitle">预览</Text>
          </View>
          <ScrollView scrollX scrollY className="previewContent">
            <View className="excelTable">
              {excelData.map((row, rowIndex) => (
                <View key={rowIndex} className="excelRow">
                  {row.map((cell, cellIndex) => (
                    <View
                      key={cellIndex}
                      className="excelCell"
                      style={{
                        backgroundColor: cell || "#f5f5f5",
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <Canvas
        canvasId="beadCanvas"
        id="beadCanvas"
        type="2d"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
        }}
      />
    </View>
  );
};

export default BeadArt;
