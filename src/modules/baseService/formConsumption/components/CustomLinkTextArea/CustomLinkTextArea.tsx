import { useState, useRef, useContext } from "react";
import ContentEditable from "react-contenteditable";
import sanitizeHtml from "sanitize-html";
import Autolinker from "autolinker";
import "./CustomLinkTextArea.scss";
import { formStateContext } from "../../Context/projectContext";
import { Controller } from "react-hook-form";

interface Props {
  formData: any;
  control: any;
  isEditAllowed: boolean;
}

const replaceFn = (match: any) => {
  switch (match.getType()) {
    case "url":
      return `<a target='_blank' rel='noopener noreferrer' contentEditable='false' href='${match.getAnchorHref()}'>${match.getAnchorText()}</a> `;
  }
};

const InputWithLinkHighlight = ({
  formData,
  control,
  isEditAllowed,
}: Props) => {
  const { setIsDirty, setValue }: any = useContext(formStateContext);
  const inputRef = useRef<any>(null);

  const handleChange = (e: any) => {
    inputRef.current = e.target.value;
  };

  const addLinks = () => {
    const linkedText = Autolinker.link(inputRef.current, {
      replaceFn,
    });
    const sanitizedHtml = sanitizeHtml(linkedText, sanitizeConf);
    setValue(
      `${formData.elementId}-fieldTypeId${formData.fieldTypeId}`,
      sanitizedHtml
    );
  };
  const sanitizeConf = {
    allowedTags: ["a"],
    allowedAttributes: { a: ["href", "target", "contenteditable", "rel"] },
  };

  return (
    <Controller
      render={({ field }: { field: any }) => {
        inputRef.current = field.value;
        return (
          <ContentEditable
            data-ph="Text area"
            className={`customLinkTextArea ${
              isEditAllowed ? "customLinkTextArea_disabled" : ""
            }`}
            tagName="div"
            html={inputRef.current}
            disabled={isEditAllowed}
            onBlur={(e: any) => {
              field.onBlur(e);
              addLinks();
            }}
            onChange={(e: any) => {
              field.onChange(e);
              handleChange(e);
              setIsDirty(true);
            }}
          />
        );
      }}
      name={`${formData.elementId}-fieldTypeId${formData.fieldTypeId}`}
      control={control}
      rules={{
        required: formData.required ? true : false,
      }}
    />
  );
};

export default InputWithLinkHighlight;
