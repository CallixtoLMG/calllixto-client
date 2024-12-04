import { Loader } from "@/components/layout";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Tab } from "semantic-ui-react";
import TagsModule from "./TagsModule";

const SettingsPage = ({ activeEntity, settingsData, isLoading, onEntityChange, settings = [], onSubmit, }) => {
  const [localTags, setLocalTags] = useState([]);
  const [initialTags, setInitialTags] = useState([]);
  const [openAccordions, setOpenAccordions] = useState({}); 
  const [isTableModified, setIsTableModified] = useState(false);

  const { control, handleSubmit, reset, getValues, formState: { isDirty, errors } } = useForm({
    defaultValues: {
      name: "",
      color: "blue",
      description: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (settingsData[activeEntity]?.tags) {
      setLocalTags(settingsData[activeEntity].tags);
      setInitialTags(settingsData[activeEntity].tags);
      setIsTableModified(false);
    }

    const initialAccordions = settings.reduce((acc, setting) => {
      acc[setting.entity] = false; 
      return acc;
    }, {});
    setOpenAccordions(initialAccordions);
  }, [settingsData, activeEntity, settings]);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key], 
    }));
  };

  const addTag = () => {
    const tagToAdd = getValues();
    if (tagToAdd.name.trim()) {
      setLocalTags((prev) => [...prev, tagToAdd]);
      reset();
      setIsTableModified(true);
    }
  };

  const removeTag = (tagToRemove) => {
    setLocalTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    setIsTableModified(true);
  };

  const handleSaveChanges = () => {
    if (!localTags.every((tag) => tag.name && tag.color)) {
      toast.error("Algunas etiquetas son inválidas. Por favor revisa los datos.");
      return;
    }
    onSubmit({ entity: activeEntity, tags: localTags });
    setIsTableModified(false);
  };

  const handleReset = () => {
    setLocalTags(initialTags);
    setIsTableModified(false);
  };

  const renderTabContent = (entity) => {
    if (isLoading) return <Loader active />;
    return (
      <Tab.Pane>
        <TagsModule
          entity={entity}
          control={control}
          errors={errors}
          localTags={localTags}
          isDirty={isDirty}
          isTableModified={isTableModified}
          onAddTag={handleSubmit(addTag)}
          onRemoveTag={removeTag}
          onReset={handleReset}
          onSaveChanges={handleSaveChanges}
          isLoading={isLoading}
          isAccordionOpen={openAccordions[entity]} 
          onToggleAccordion={() => toggleAccordion(entity)}
        />
      </Tab.Pane>
    );
  };

  const panes = settings.map(({ entity, label }) => ({
    menuItem: label,
    render: () => renderTabContent(entity),
  }));

  return <Tab panes={panes} onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex]?.entity)} />;
};

export default SettingsPage;
