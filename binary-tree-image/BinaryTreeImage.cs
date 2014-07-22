/*
 * Copyright 2007 Einar Egilsson  ( http://tech.einaregilsson.com )
 * For details about this project see http://tech.einaregilsson.com/2007/09/20/binary-tree-image
 */

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;

namespace EinarEgilsson
{
    public interface INode
    {
        INode Left { get;}
        INode Right { get; }
        string Text { get;}
        object Value { get; }
    }

    /// <summary>
    /// Class for creating images of binary tree structures. Nodes in the binary tree
    /// must implement the INode interface. See http://tech.einaregilsson.com/2007/09/20/binary-tree-image
    /// for more details.
    /// </summary>
    public class BinaryTreeImage
    {
        #region Constants
        protected const int NodeWidth = 35;
        protected const int HalfNodeWidth = NodeWidth / 2;
        protected const int DX = 10;
        protected const int DY = 10;
        protected const int FontSize = 10;
        protected const string FontName = "Arial";
        protected const int Padding = 20;

        protected readonly Brush Background = Brushes.White;
        protected readonly Pen MainPen = Pens.Black;
        protected readonly Brush ValueBrush = Brushes.Blue;
        protected readonly Brush TextBrush = Brushes.Black;
        protected readonly Font TextFont = new Font(FontName, FontSize);
        protected readonly Font ValueFont = new Font(FontName, FontSize, FontStyle.Bold);
        #endregion

        #region Members
        private int _treeDepth = 0;
        private Bitmap _bitmap;
        private Graphics _graphics;
        #endregion

        #region Public
        public BinaryTreeImage(INode root)
        {
            CreateImage(root);
        }

        public virtual Bitmap Bitmap
        {
            get { return _bitmap; }
        }

        public virtual void Save(string filename, ImageFormat format)
        {
            _bitmap.Save(filename, format);
        }

        public virtual void Save(string filename)
        {
            Save(filename, ImageFormat.Jpeg);
        }

        public virtual void WriteToStream(Stream outputStream, ImageFormat format)
        {
            _bitmap.Save(outputStream, format);
        }

        public virtual void WriteToStream(Stream outputStream)
        {
            WriteToStream(outputStream, ImageFormat.Jpeg);
        }

        public virtual void Show()
        {
            string filename = Path.GetTempFileName() + ".jpg";
            Save(filename);
            System.Diagnostics.Process.Start(filename);
        }

        #endregion

        #region Image Creation

        protected virtual void CreateImage(INode root)
        {
            int canvasWidth, canvasHeight;
            ImageNode iroot = CreateImageNodeTree(root, 1);
            if (iroot == null)
                canvasHeight = canvasWidth = 30;
            else
            {
                canvasWidth = iroot.TotalWidth + Padding * 2;
                canvasHeight = _treeDepth * (NodeWidth + DY) + 1 * NodeWidth;
            }

            _bitmap = new Bitmap(canvasWidth, canvasHeight);
            _graphics = Graphics.FromImage(_bitmap);
            _graphics.FillRectangle(Background, 0, 0, _bitmap.Width, _bitmap.Height);
            DrawNode(iroot, true, 1, new Rectangle(0 - HalfNodeWidth, 0, NodeWidth, NodeWidth));
        }

        protected virtual ImageNode CreateImageNodeTree(INode node, int depth)
        {
            if (node == null)
                return null;

            _treeDepth = Math.Max(_treeDepth, depth);

            ImageNode left = CreateImageNodeTree(node.Left, depth + 1);
            ImageNode right = CreateImageNodeTree(node.Right, depth + 1);
            ImageNode newNode = new ImageNode();
            newNode.Node = node;
            newNode.Left = left;
            newNode.Right = right;

            newNode.RightTreeWidth = (right == null) ? 0 : right.TotalWidth;
            newNode.LeftTreeWidth = (left == null) ? 0 : left.TotalWidth;
            newNode.TotalWidth = newNode.RightTreeWidth + newNode.LeftTreeWidth + NodeWidth + DX;

            return newNode;
        }
        #endregion

        #region Draw Nodes
        protected virtual Rectangle DrawNode(ImageNode node, bool isRightChild, int depth, Rectangle parentBounds)
        {
            int x, y;
            if (node == null) return new Rectangle() ;

            int offset = (isRightChild) ? node.LeftTreeWidth + NodeWidth + DX : -node.RightTreeWidth - NodeWidth - DX;
            x = parentBounds.X + offset;
            y = depth * (DY + NodeWidth) - HalfNodeWidth;

            Rectangle bounds = new Rectangle(x, y, NodeWidth, NodeWidth);

            _graphics.DrawEllipse(MainPen, bounds);
            DrawNodeText(node, bounds);

            if (node.Left != null)
            {
                Rectangle leftBounds = DrawNode(node.Left, false, depth + 1, bounds);
                _graphics.DrawLine(MainPen, leftBounds.X + HalfNodeWidth, leftBounds.Y, bounds.X + HalfNodeWidth, bounds.Y + NodeWidth);
            }
            if (node.Right != null)
            {
                Rectangle rightBounds = DrawNode(node.Right, true, depth + 1, bounds);
                _graphics.DrawLine(MainPen, rightBounds.X + HalfNodeWidth, rightBounds.Y, bounds.X + HalfNodeWidth, bounds.Y + NodeWidth);
            }

            return bounds;
        }

        protected virtual void DrawNodeText(ImageNode node, Rectangle nodeBounds)
        {
            StringFormat strFormat = new StringFormat();
            strFormat.Alignment = StringAlignment.Center;

            RectangleF typeBounds = new RectangleF(nodeBounds.X - 50, nodeBounds.Y + HalfNodeWidth - TextFont.GetHeight(), 100 + NodeWidth, TextFont.GetHeight());
            _graphics.DrawString(node.Node.Text, TextFont, TextBrush, typeBounds, strFormat);

            if (node.Node.Value != null)
            {
                RectangleF valueBounds = new RectangleF(nodeBounds.X - 50, nodeBounds.Y + NodeWidth - ValueFont.GetHeight(), 100 + NodeWidth, ValueFont.GetHeight());
                _graphics.DrawString(node.Node.Value.ToString(), ValueFont, ValueBrush, valueBounds, strFormat);
            }
        }
        #endregion

        #region Class VisualNode
        protected class ImageNode
        {
            public INode Node;
            public ImageNode Right;
            public ImageNode Left;
            public int LeftTreeWidth;
            public int RightTreeWidth;
            public int TotalWidth;
        }
        #endregion
    }
}
