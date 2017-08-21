
var FilterExprFrameRE=/%frame%\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/;
var FilterExprValueRE=/%value%\.([a-zA-Z0-9_]+)/;
var FilterExprValueFieldRE=/%valuef%\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/;
var FilterExprAliasRE=/%alias%\.([a-zA-Z0-9_\.]+)/;

var CMSFrameFields_DependFieldsA=[];

var CMSFrame_VariantButtonsIndexesA=[];

function CMSFrameFields_RegisterDependFields(FilterExpr_,DependObjectName)
{
  var FilterExpr=FilterExpr_;
  while ( true )
  {
    var Res=FilterExprFrameRE.exec(FilterExpr);
    if ( Res==null )
      break;

    var FrameStrId=Res[1];
    var FrameName=parent.CMSFrame_ComposeName(FrameStrId);
    var MasterObjectName=Res[2].toUpperCase();

    CMSFrameFields_DependFieldsA.push({master_frame_name:FrameName, master_object_name:MasterObjectName, depend_object_name:DependObjectName});

    FilterExpr=RegExp.rightContext;
  }

  FilterExpr=FilterExpr_;
  while ( true )
  {
    var Res=FilterExprValueRE.exec(FilterExpr);
    if ( Res==null )
      break;

    var MasterObjectName=Res[1].toUpperCase();
    CMSFrameFields_DependFieldsA.push({master_frame_name:'', master_object_name:MasterObjectName, depend_object_name:DependObjectName});

    FilterExpr=RegExp.rightContext;
  }

  FilterExpr=FilterExpr_;
  while ( true )
  {
    var Res=FilterExprValueFieldRE.exec(FilterExpr);
    if ( Res==null )
      break;

    var MasterObjectName=Res[1].toUpperCase();
    CMSFrameFields_DependFieldsA.push({master_frame_name:'', master_object_name:MasterObjectName, depend_object_name:DependObjectName});

    FilterExpr=RegExp.rightContext;
  }

}

function CMSFrameFields_UpdateVariantButtonConditions(ButtonH)
{

  var ObjectName=ButtonH[parent.VariantButtons_BUTTON_ID];
//alert(ObjectName);
  ButtonObj=GetObj(ObjectName);
  if ( !ButtonObj )
    alert('CMSFrameFields_UpdateVariantButtonConditions: frame '+FrameStrId+' variant button '+ObjectName+'/'+ButtonH[parent.VariantButtons_CAPTION]+' not found');
  else
  {
    var ButtonVisibleExpr=ButtonH[parent.VariantButtons_VISIBLE_EXPR];
    var ButtonEnableExpr=ButtonH[parent.VariantButtons_ENABLE_EXPR];

    var VisibleFlag=(ButtonVisibleExpr=="")?true:eval(CMSFrameFields_ResolveFilter(ButtonVisibleExpr,true));
    if ( !VisibleFlag )
      ButtonObj.style.display='none';
    else
    {
      ButtonObj.style.display='';
      var EnableFlag=(ButtonEnableExpr=="")?true:eval(CMSFrameFields_ResolveFilter(ButtonEnableExpr,true));
      ButtonObj.disabled=!EnableFlag;
    }
  }
  
}

function CMSFrameFields_ResolveFilter(FilterExpr,AutoApostrofs)
{
  // разберём %frame%
  var ResolvedExpr="";
  while ( true )
  {
    var Res=FilterExprFrameRE.exec(FilterExpr);
    if ( Res==null )
      break;
    ResolvedExpr+=RegExp.leftContext;

    var FrameStrId=Res[1];
    var FieldName=Res[2];
    //var FrameName=parent.CMSFrame_ComposeName(FrameStrId);
    var ContainerWindow=IFrame_GetContainer();
    var FrameName=ContainerWindow.CMSFrame_ComposeName(FrameStrId);
    //var FrameObj=parent.frames[FrameName];
    //var FrameObj=GetFrameWindow(parent.GetFrame(FrameName));
    var FrameObj=IFrame_GetSiblingWindow(FrameName);
    var ValueVal=-1;

    if ( !FrameObj )
      alert('CMSFrameFields_ResolveFilter: macro %frame% - Frame '+FrameName+' not found!');
    else
      if ( FrameObj.RecordsCount )
      {
        var ValueVarName=FrameStrId+"_"+FieldName.toUpperCase();
        var ValueI=FrameObj[ValueVarName];
        var SelectedKeyValue=/*parent.*/ContainerWindow.CMS_GetSelectedKeyValue(FrameObj);
        if ( FrameObj.Tree_GetStorage )
        {
          var TreeStorage=FrameObj.Tree_GetStorage(FrameObj.TableStrId);
          var SelectedI=FrameObj.GetSelectedRowIndex(TreeStorage.TreeArray,TreeStorage.IdFieldI,TreeStorage.SelectedKeyValue);
          if ( SelectedI!=-1 )
            ValueVal=TreeStorage.TreeArray[SelectedI][ValueI];
        }
        else
        {
          var SelectedI=FrameObj.GetSelectedRowIndex(FrameObj.Array,FrameObj.KeyFieldI,FrameObj.SelectedKeyValue);
          if ( SelectedI!=-1 )
            ValueVal=FrameObj.Array[SelectedI][ValueI];
        }
        if ( AutoApostrofs && !StringIsInteger(ValueVal) )
          ValueVal="'"+StrToJSStr(ValueVal)+"'";
      }
      else
        ValueVal=-1;
    ResolvedExpr+=ValueVal;

    FilterExpr=RegExp.rightContext;
  }
  ResolvedExpr+=FilterExpr;
  FilterExpr=ResolvedExpr;

  // разберём %value%
//alert(1+' '+FilterExpr);
  var ResolvedExpr="";
  while ( true )
  {
    var Res=FilterExprValueRE.exec(FilterExpr);
    if ( Res==null )
      break;
    ResolvedExpr+=RegExp.leftContext;
//alert(2+' '+ResolvedExpr);

    var ObjectName=Res[1].toUpperCase();
    var Obj=GetObj(ObjectName);
    if ( !Obj )
    {
      alert('CMSFrameFields_ResolveFilter: macro %value% - Value '+ObjectName+' not found!');
      ValueVal=-1;
    }
    else
    {
      if ( (Obj.tagName=='INPUT') && (Obj.type=='radio') )
      {
        var FormObj=document.forms.FormDetail[ObjectName];
        var ValueVal=GetRadioGroupValue(FormObj);
      }
      else if ( (Obj.tagName=='INPUT') && (Obj.type=='checkbox') )
        var ValueVal=Obj.checked?1:0;
      else if ( 'tree_str_id' in Obj )
      {
        // для встроенного или выпадающего дерева value - concat-строка
        // ключей и значений; а нам надо получить выбранное сейчас значение
        //alert(GetObjectProps(Obj));
        var TreeStrId=Obj['tree_str_id'];
        var Storage=Tree_GetStorage(TreeStrId);
        //alert(GetObjectProps(Storage));
        var ValueVal=Storage.SelectedKeyValue;
      }
      else
        var ValueVal=Obj.value;
    }
    ResolvedExpr+=AutoApostrofs?("'"+StrToJSStr(ValueVal)+"'"):ValueVal;
//alert(3+' '+ResolvedExpr);

    FilterExpr=RegExp.rightContext;
  }
  ResolvedExpr+=FilterExpr;
//alert(4+' '+ResolvedExpr);
  FilterExpr=ResolvedExpr;

  // разберём %valuef%
  var ResolvedExpr="";
  while ( true )
  {
    var Res=FilterExprValueFieldRE.exec(FilterExpr);
    if ( Res==null )
      break;
    ResolvedExpr+=RegExp.leftContext;

    var ObjectName=Res[1].toUpperCase();
    var FieldName=Res[2].toUpperCase();
    var Obj=GetObj(ObjectName);
    ValueVal=-1;
    if ( !Obj )
    {
      alert('CMSFrameFields_ResolveFilter: Value '+ObjectName+' not found!');
      break;
    }
    //var ValueVal=Obj.value;
    var RefVal=Obj.value;
    if ( (!(ObjectName in CMSFrameFields_FieldsAuxInfoH)) || !('DataArrayPrefix' in CMSFrameFields_FieldsAuxInfoH[ObjectName]) )
    {
      alert('CMSFrameFields_ResolveFilter: macro %valuef% - Aux info for field '+ObjectName+' not found!');
      break;
    }
    var DataArrayPrefix=CMSFrameFields_FieldsAuxInfoH[ObjectName]['DataArrayPrefix'];
    var ArrayName=DataArrayPrefix+'_Array';
    var FieldName=DataArrayPrefix+'_'+FieldName;
    var FieldIndex=window[FieldName];
    var DataA=window[ArrayName];
    for ( var D=0; D<DataA.length; D++ )
      if ( DataA[D][0]==RefVal )
      {
        ValueVal=DataA[D][FieldIndex];
        break;
      }
    ResolvedExpr+=AutoApostrofs?("'"+StrToJSStr(ValueVal)+"'"):ValueVal;

    FilterExpr=RegExp.rightContext;
  }
  ResolvedExpr+=FilterExpr;
  FilterExpr=ResolvedExpr;

  // разберём %alias%
  var ResolvedExpr="";
  while ( true )
  {
    var Res=FilterExprAliasRE.exec(FilterExpr);
    if ( Res==null )
      break;
    ResolvedExpr+=RegExp.leftContext;

    var FieldName=Res[1];
    //ResolvedExpr+='AuxR.'+FieldName;
    ResolvedExpr+='AuxR["'+FieldName+'"]';

    FilterExpr=RegExp.rightContext;
  }
  ResolvedExpr+=FilterExpr;
  FilterExpr=ResolvedExpr;

  return FilterExpr;
}

function CMSAjaxReady(ResultH,Errors)
{
  //console.log('@');
  //console.log("A "+ResultH.php);
  eval(ResultH.php);
  //console.log("B "+ResultH.php);
}
